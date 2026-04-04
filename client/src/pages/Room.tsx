import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Copy, Share2 } from "lucide-react"

import getSocket from "../utils/websocket-connection"
import { useRoomStore } from '../store/useRoomStore'

import RoomChat from '../Components/RoomChat'
import RoomControls from '../Components/RoomControls'
import RoomGrid from '../Components/RoomGrid'
import SettingsModal from '../Components/SettingsModal'

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
  type WebSocketConn = Awaited<ReturnType<typeof getSocket>>
  const socketRef = useRef<WebSocketConn | null>(null)
  const iceCandidateQueue = useRef<Map<string, RTCIceCandidate[]>>(new Map())

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recordingCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const recordingRafRef = useRef<number | null>(null)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
          video: { cursor: "always" },
          audio: false,
          preferCurrentTab: false
        } as any)
        window.focus()
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
        setTimeout(() => window.focus(), 100)
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
      if (recordingRafRef.current) cancelAnimationFrame(recordingRafRef.current)
      recordingRafRef.current = null
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      return
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1280
      canvas.height = 720
      recordingCanvasRef.current = canvas
      const ctx = canvas.getContext('2d')!

      const drawFrame = () => {
        ctx.fillStyle = '#121212'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const videos: HTMLVideoElement[] = []
        if (videoRef.current && videoRef.current.readyState >= 2) videos.push(videoRef.current)
        Object.values(remoteVideosRef.current).forEach(v => {
          if (v && v.readyState >= 2) videos.push(v)
        })
        if (videos.length === 0) {
          recordingRafRef.current = requestAnimationFrame(drawFrame)
          return
        }
        const cols = videos.length === 1 ? 1 : videos.length <= 4 ? 2 : 3
        const rows = Math.ceil(videos.length / cols)
        const tileW = canvas.width / cols
        const tileH = canvas.height / rows
        videos.forEach((vid, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          try {
            ctx.drawImage(vid, col * tileW, row * tileH, tileW, tileH)
          } catch (_) {}
        })
        recordingRafRef.current = requestAnimationFrame(drawFrame)
      }
      drawFrame()

      const canvasStream = canvas.captureStream(30)
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(t => canvasStream.addTrack(t))
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm'

      const mediaRecorder = new MediaRecorder(canvasStream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        if (recordingRafRef.current) cancelAnimationFrame(recordingRafRef.current)
        recordingRafRef.current = null
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        chunksRef.current = []
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `deepconv-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
        document.body.appendChild(a)
        a.click()
        setTimeout(() => { window.URL.revokeObjectURL(url); a.remove() }, 1000)
        setIsRecording(false)
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
    } catch (err) {
      console.error('Recording failed:', err)
    }
  }

  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    })

    const isScreenSharing = useRoomStore.getState().isScreenSharing
    const sourceStream = isScreenSharing && screenStreamRef.current ? screenStreamRef.current : streamRef.current
    sourceStream?.getTracks().forEach(track => {
      pc.addTrack(track, sourceStream)
    })

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("candidate", { to: peerId, candidate: e.candidate })
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
    let socket: WebSocketConn | null = null

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
        socket = await getSocket(roomId)
        if (ignore) {
          socket?.disconnect()
          return
        }
        if (!socket) return
        socketRef.current = socket

        const activeSocket = socket

        activeSocket.on("existing-users", (users: { id: string; name: string }[]) => {
          setParticipantCount(users.length + 1)
          const ids = users.map(u => u.id)
          const nameMap: Record<string, string> = {}
          users.forEach(u => nameMap[u.id] = u.name)
          setParticipantIds(ids)
          setParticipantNames(prev => ({ ...prev, ...nameMap }))
          users.forEach(async (user) => {
            const pc = createPeerConnection(user.id)
            peerConnections.current.set(user.id, pc)
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            activeSocket.emit("offer", { to: user.id, offer })
          })
        })

        activeSocket.on("user-connected", (user: { id: string; name: string }) => {
          setParticipantCount(prev => prev + 1)
          setParticipantIds(prev => [...prev, user.id])
          setParticipantNames(prev => ({ ...prev, [user.id]: user.name }))
        })

        activeSocket.on("offer", async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
          if (!peerConnections.current.has(from)) {
            const pc = createPeerConnection(from)
            peerConnections.current.set(from, pc)
          }
          const pc = peerConnections.current.get(from)!
          await pc.setRemoteDescription(new RTCSessionDescription(offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          activeSocket.emit("answer", { to: from, answer })
          const queuedCandidates = iceCandidateQueue.current.get(from) || []
          for (const candidate of queuedCandidates) {
            try { await pc.addIceCandidate(candidate) } catch (e) {}
          }
          iceCandidateQueue.current.delete(from)
        })

        activeSocket.on("answer", async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
          const pc = peerConnections.current.get(from)
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer))
            const queuedCandidates = iceCandidateQueue.current.get(from) || []
            for (const candidate of queuedCandidates) {
              try { await pc.addIceCandidate(candidate) } catch (e) {}
            }
            iceCandidateQueue.current.delete(from)
          }
        })

        activeSocket.on("candidate", async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
          const pc = peerConnections.current.get(from)
          if (pc && candidate) {
            if (pc.remoteDescription) {
              try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch (e) {}
            } else {
              if (!iceCandidateQueue.current.has(from)) iceCandidateQueue.current.set(from, [])
              iceCandidateQueue.current.get(from)!.push(new RTCIceCandidate(candidate))
            }
          }
        })

        activeSocket.on("user-disconnected", (userId: string) => {
          setParticipantCount(prev => prev - 1)
          setParticipantIds(prev => prev.filter(id => id !== userId))
          setHandRaises(prev => {
            const next = { ...prev }
            delete next[userId]
            return next
          })
          peerConnections.current.get(userId)?.close()
          peerConnections.current.delete(userId)
          delete remoteVideosRef.current[userId]
        })

        activeSocket.on("hand-raise", ({ from, isRaised }: { from: string; isRaised: boolean }) => {
          setHandRaises(prev => ({ ...prev, [from]: isRaised }))
        })

        activeSocket.on("chat-message", ({ from, message, type, fileName, time }: { from: string; message: string; type?: 'text' | 'image' | 'file'; fileName?: string; time?: number }) => {
          setMessages(prev => [
            ...prev,
            {
              sender: from,
              text: message,
              time: new Date(time ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: type || 'text',
              fileName
            }
          ])
        })

        activeSocket.on("chat-history", (history: Array<{ from: string; message: string; time: number; type?: 'text' | 'image' | 'file'; fileName?: string }>) => {
          const formattedHistory = history.map(msg => ({
            sender: msg.from,
            text: msg.message,
            time: new Date(msg.time > 1e12 ? msg.time : msg.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: msg.type || 'text' as 'text' | 'image' | 'file',
            fileName: msg.fileName
          }))
          setMessages(formattedHistory)
        })

        activeSocket.emit("join", { roomId, name: storedName })
      } catch (error) {
        console.error("Failed to connect:", error)
        alert("Failed to connect to server. Please try again.")
      }
    }

    initializeRoom()

    return () => {
      ignore = true
      if (recordingRafRef.current) cancelAnimationFrame(recordingRafRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop()
      if (socket) socket.disconnect()
      if (socketRef.current) socketRef.current.disconnect()
      peerConnections.current.forEach(pc => pc.close())
      peerConnections.current.clear()
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop())
    }
  }, [roomId])

  return (
    <section className="bg-[#121212] flex flex-col font-sans relative overflow-hidden h-screen w-screen" onContextMenu={(e) => e.preventDefault()}>
      <header className="absolute top-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-[#121212]/80 to-transparent pointer-events-none">
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

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <RoomChat socketRef={socketRef} roomId={roomId} />
      <RoomGrid videoRef={videoRef} remoteVideosRef={remoteVideosRef} />
      <RoomControls
        toggleMic={toggleMic}
        toggleVideo={toggleVideo}
        toggleScreenShare={toggleScreenShare}
        toggleHandRaise={toggleHandRaise}
        toggleRecording={toggleRecording}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </section>
  )
}

export default Room
