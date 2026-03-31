import { useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Copy, Share2 } from "lucide-react"

import getSocket from "../utils/websocket-connection"
import { useRoomStore } from '../store/useRoomStore'

import RoomChat from '../Components/RoomChat'
import RoomControls from '../Components/RoomControls'
import RoomGrid from '../Components/RoomGrid'

const Room = () => {
  const navigate = useNavigate()
  const { roomId } = useParams()
  if (!roomId) {
    navigate("/")
    return null
  }

  const {
    participantCount,
    setParticipantCount,
    setParticipantIds,
    setParticipantNames,
    setHandRaises,
    setMessages,
    setUserName,
    setIsScreenSharing,
    setIsRecording
  } = useRoomStore()

  const videoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<{ [id: string]: HTMLVideoElement }>({})
  const streamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const socketRef = useRef<any>(null)
  const iceCandidateQueue = useRef<Map<string, RTCIceCandidate[]>>(new Map())

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const setupMediaDevices = async () => {
    try {
      const preferredMic = localStorage.getItem('preferredMic') || undefined
      const preferredCamera = localStorage.getItem('preferredCamera') || undefined
      
      const constraints: MediaStreamConstraints = {
        audio: preferredMic ? { deviceId: { exact: preferredMic } } : true,
        video: preferredCamera ? { deviceId: { exact: preferredCamera } } : true
      }
      
      streamRef.current = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.current) videoRef.current.srcObject = streamRef.current
    } catch (err) {
      console.error(err)
    }
  }

  const toggleMic = () => {
    if (streamRef.current?.getAudioTracks().length) {
      const enabled = !streamRef.current.getAudioTracks()[0].enabled
      streamRef.current.getAudioTracks()[0].enabled = enabled
      useRoomStore.getState().setIsMicOn(enabled)
    }
  }

  const toggleVideo = () => {
    if (streamRef.current?.getVideoTracks().length) {
      const enabled = !streamRef.current.getVideoTracks()[0].enabled
      streamRef.current.getVideoTracks()[0].enabled = enabled
      useRoomStore.getState().setIsVideoOn(enabled)
    }
  }

  const toggleScreenShare = async () => {
    const state = useRoomStore.getState()
    if (state.isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
      setIsScreenSharing(false)
      
      const videoTrack = streamRef.current?.getVideoTracks()[0]
      if (videoTrack) {
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(videoTrack).catch(() => {})
        })
        if (videoRef.current) videoRef.current.srcObject = streamRef.current
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: false
        })
        screenStreamRef.current = displayStream
        setIsScreenSharing(true)
        
        displayStream.getVideoTracks()[0].onended = () => {
           if (useRoomStore.getState().isScreenSharing) toggleScreenShare()
        }

        const screenTrack = displayStream.getVideoTracks()[0]
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(screenTrack).catch(() => {})
        })
        if (videoRef.current) videoRef.current.srcObject = displayStream
      } catch (err) {
        console.error(err)
      }
    }
  }

  const toggleHandRaise = () => {
    const state = useRoomStore.getState()
    const newHandState = !state.isHandRaised
    state.setIsHandRaised(newHandState)
    if (socketRef.current) {
      socketRef.current.emit("hand-raise", { roomId, isRaised: newHandState })
    }
  }

  const toggleRecording = async () => {
    const state = useRoomStore.getState()
    if (state.isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
      return
    }
    
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      if (streamRef.current) {
        const audioTracks = streamRef.current.getAudioTracks()
        if (audioTracks.length > 0) displayStream.addTrack(audioTracks[0])
      }
      
      const mediaRecorder = new MediaRecorder(displayStream, { mimeType: 'video/webm' })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        chunksRef.current = [] 
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `meeting-recording-${Date.now()}.webm`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        setIsRecording(false)
      }

      displayStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop()
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
    } catch (err) {
      console.error(err)
    }
  }

  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    })

    const isScreenSharing = useRoomStore.getState().isScreenSharing;
    const sourceStream = isScreenSharing && screenStreamRef.current ? screenStreamRef.current : streamRef.current;
    
    sourceStream?.getTracks().forEach(track => {
      pc.addTrack(track, sourceStream)
    })

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("candidate", {
          to: peerId,
          candidate: e.candidate
        })
      }
    }

    pc.ontrack = (e) => {
      const remoteVideo = remoteVideosRef.current[peerId]
      if (remoteVideo && e.streams[0]) {
        remoteVideo.srcObject = e.streams[0]
      }
    }

    return pc
  }

  useEffect(() => {
    let ignore = false
    
    const initializeRoom = async () => {
      let storedName = localStorage.getItem("userName")
      if (!storedName) {
         storedName = window.prompt("Enter your name", `Guest-${Math.floor(Math.random() * 1000)}`) || `Guest-${Math.floor(Math.random() * 1000)}`
         localStorage.setItem("userName", storedName)
      }
      setUserName(storedName)

      await setupMediaDevices()
      if (ignore) return
      
      try {
        const socket = await getSocket(roomId)
        if (ignore) {
          socket.disconnect()
          return
        }
        
        socketRef.current = socket

        socket.on("existing-users", (users: {id: string, name: string}[]) => {
          setParticipantCount(users.length + 1)
          const ids = users.map(u => u.id)
          const nameMap: Record<string, string> = {}
          users.forEach(u => nameMap[u.id] = u.name)
          
          setParticipantIds(ids)
          setParticipantNames(prev => ({...prev, ...nameMap}))
          
          users.forEach(async (user) => {
            const pc = createPeerConnection(user.id)
            peerConnections.current.set(user.id, pc)
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket.emit("offer", {
              to: user.id,
              offer
            })
          })
        })

        socket.on("user-connected", (user: {id: string, name: string}) => {
          setParticipantCount(prev => prev + 1)
          setParticipantIds(prev => [...prev, user.id])
          setParticipantNames(prev => ({...prev, [user.id]: user.name}))
        })

        socket.on("offer", async ({ from, offer }) => {
          if (!peerConnections.current.has(from)) {
            const pc = createPeerConnection(from)
            peerConnections.current.set(from, pc)
          }
          const pc = peerConnections.current.get(from)!
          await pc.setRemoteDescription(new RTCSessionDescription(offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit("answer", {
            to: from,
            answer
          })
          const queuedCandidates = iceCandidateQueue.current.get(from) || []
          for (const candidate of queuedCandidates) {
            try {
              await pc.addIceCandidate(candidate)
            } catch (e) {}
          }
          iceCandidateQueue.current.delete(from)
        })

        socket.on("answer", async ({ from, answer }) => {
          const pc = peerConnections.current.get(from)
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer))
            const queuedCandidates = iceCandidateQueue.current.get(from) || []
            for (const candidate of queuedCandidates) {
              try {
                await pc.addIceCandidate(candidate)
              } catch (e) {}
            }
            iceCandidateQueue.current.delete(from)
          }
        })

        socket.on("candidate", async ({ from, candidate }) => {
          const pc = peerConnections.current.get(from)
          if (pc && candidate) {
            if (pc.remoteDescription) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate))
              } catch (e) {}
            } else {
              if (!iceCandidateQueue.current.has(from)) {
                iceCandidateQueue.current.set(from, [])
              }
              iceCandidateQueue.current.get(from)!.push(new RTCIceCandidate(candidate))
            }
          }
        })

        socket.on("user-disconnected", (userId: string) => {
          setParticipantCount(prev => prev - 1)
          setParticipantIds(prev => prev.filter(id => id !== userId))
          setHandRaises(prev => {
            const newHandles = {...prev}
            delete newHandles[userId]
            return newHandles
          })
          peerConnections.current.get(userId)?.close()
          peerConnections.current.delete(userId)
          delete remoteVideosRef.current[userId]
        })

        socket.on("hand-raise", ({ from, isRaised }) => {
          setHandRaises(prev => ({ ...prev, [from]: isRaised }))
        })

        socket.on("chat-message", ({ from, message, type, fileName }) => {
          setMessages(prev => [
              ...prev, 
              { sender: from, text: message, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}), type: type || 'text', fileName }
          ])
        })

        socket.emit("join", { roomId, name: storedName })
      } catch (error) {
        console.error("Failed to connect:", error)
        alert("Failed to connect to server. Please try again.")
      }
    }

    initializeRoom()

    return () => {
      ignore = true
      if (socketRef.current) socketRef.current.disconnect()
      peerConnections.current.forEach(pc => pc.close())
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop())
    }
  }, [roomId])

  return (
    <section className="bg-[#121212] flex flex-col font-sans relative overflow-hidden h-screen w-screen" onContextMenu={(e) => e.preventDefault()}>
      <header className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-[#121212]/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 bg-[#1c1c1c]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#333] text-white pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-semibold">{participantCount > 1 ? `${participantCount} Participants` : "Waiting for others..."}</span>
        </div>
        <div className="flex gap-2 pointer-events-auto">
          <button onClick={() => navigator.clipboard.writeText(roomId)} className="p-2 text-white bg-[#1c1c1c]/80 backdrop-blur-md hover:bg-[#2a2a2a] border border-[#333] rounded-full transition">
            <Copy size={20} />
          </button>
          <button onClick={() => navigator.share?.({ title: "Join", text: `ID: ${roomId}`, url: window.location.href }) || navigator.clipboard.writeText(roomId)} className="flex items-center gap-2 px-4 py-2 bg-[#0B5CFF] hover:bg-[#1C68FF] text-white font-semibold rounded-full transition shadow-lg">
            <Share2 size={18} />
            <span className="hidden sm:inline">Share Link</span>
          </button>
        </div>
      </header>

      <RoomChat socketRef={socketRef} roomId={roomId} />
      <RoomGrid videoRef={videoRef} remoteVideosRef={remoteVideosRef} />
      <RoomControls toggleMic={toggleMic} toggleVideo={toggleVideo} toggleScreenShare={toggleScreenShare} toggleHandRaise={toggleHandRaise} toggleRecording={toggleRecording} />
    </section>
  )
}

export default Room
