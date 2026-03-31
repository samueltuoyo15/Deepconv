import React, { useRef } from 'react'
import { Hand, MicOff, MonitorUp, Minimize2, Move } from 'lucide-react'
import { useRoomStore } from '../store/useRoomStore'

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
  remoteVideosRef: React.MutableRefObject<Record<string, HTMLVideoElement>>;
}

const RoomGrid = ({ videoRef, remoteVideosRef }: Props) => {
  const { 
    userName, 
    isMicOn, 
    isVideoOn, 
    isScreenSharing, 
    isHandRaised, 
    participantIds, 
    participantNames, 
    handRaises,
    popoutStates,
    setPopoutStates,
    drags,
    setDrags,
    isChatOpen
  } = useRoomStore()

  const dragRef = useRef<{ id: string | null, startX: number, startY: number, initialX: number, initialY: number }>({ id: null, startX: 0, startY: 0, initialX: 0, initialY: 0 })

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (!popoutStates[id]) return;
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, initialX: drags[id]?.x || 50, initialY: drags[id]?.y || 50 }
    if (e.currentTarget) e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragRef.current.id) {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      
      const newX = dragRef.current.initialX + dx
      const newY = dragRef.current.initialY + dy
      
      setDrags({ ...drags, [dragRef.current.id]: { ...drags[dragRef.current.id], x: newX, y: newY } })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.id) {
       const id = dragRef.current.id
       const currentPos = drags[id]
       localStorage.setItem(`drags-${id}`, JSON.stringify(currentPos))
       if (e.currentTarget) e.currentTarget.releasePointerCapture(e.pointerId)
       dragRef.current.id = null
    }
  }

  const initLocalPos = (id: string, defaultX: number, defaultY: number) => {
     if (!drags[id]) {
       const saved = localStorage.getItem(`drags-${id}`)
       if (saved) {
         setDrags({ ...drags, [id]: JSON.parse(saved) })
       } else {
         setDrags({ ...drags, [id]: { x: defaultX, y: defaultY } })
       }
     }
  }

  return (
    <div className={`flex-1 p-4 lg:p-8 flex items-center justify-center pt-20 pb-32 md:pb-28 ${isChatOpen ? 'md:pr-[26rem]' : ''} transition-all overflow-hidden`}>
      <div className={`grid gap-4 w-full h-full max-h-[85vh] ${
        participantIds.length === 0 ? 'grid-cols-1 max-w-4xl' :
        participantIds.length === 1 ? 'grid-cols-1 md:grid-cols-2 max-w-6xl' :
        participantIds.length === 2 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      }`}>
        
        {/* Local Video */}
        <div className={popoutStates['local'] ? "fixed z-50 w-72 md:w-96 aspect-video bg-[#1c1c1c] cursor-move shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border-2 border-[#0B5CFF] resize overflow-auto" : "relative bg-[#1c1c1c] rounded-xl overflow-hidden aspect-[3/4] md:aspect-video shadow-2xl transition-all border border-[#333]"}
            style={popoutStates['local'] ? { 
                left: drags['local']?.x ?? (typeof window !== 'undefined' ? window.innerWidth/2 - 192 : 50), 
                top: drags['local']?.y ?? (typeof window !== 'undefined' ? window.innerHeight/2 - 100 : 50) 
            } : {}}
            onPointerDown={(e) => {
                initLocalPos('local', window.innerWidth/2 - 192, window.innerHeight/2 - 100)
                handlePointerDown(e, 'local')
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
          {popoutStates['local'] && (
             <div className="absolute top-2 right-2 flex gap-2 z-20 pointer-events-auto">
               <button 
                 onClick={(e) => { e.stopPropagation(); setPopoutStates({...popoutStates, local: false}) }} 
                 className="bg-[#2a2a2a]/90 hover:bg-neutral-600 p-1.5 rounded text-white shadow"
               >
                  <Minimize2 size={14} />
               </button>
             </div>
          )}
          {!popoutStates['local'] && (
             <button 
               onClick={(e) => { e.stopPropagation(); setPopoutStates({...popoutStates, local: true}); initLocalPos('local', window.innerWidth/2 - 192, window.innerHeight/2 - 100); }} 
               className="absolute top-4 left-4 bg-[#2a2a2a]/80 hover:bg-[#0B5CFF] backdrop-blur-sm p-1.5 rounded-lg text-white shadow-lg transition-colors pointer-events-auto z-10"
               title="Pop out / Drag"
             >
                <MonitorUp size={16} />
             </button>
          )}

          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover pointer-events-none ${!isVideoOn && !isScreenSharing ? 'hidden' : ''}`}
          />
          {!isVideoOn && !isScreenSharing && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1c1c1c]">
              <img src="/avatars/user1.png" alt="Avatar" className="w-32 h-32 rounded-full shadow-2xl border-4 border-[#333]" />
            </div>
          )}
          {isScreenSharing && (
            <div className="absolute top-4 right-4 bg-[#0B5CFF] px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg animate-pulse z-20">
              Presenting
            </div>
          )}
          {isHandRaised && (
            <div className="absolute top-14 right-4 bg-[#1c1c1c]/80 backdrop-blur-sm p-2 rounded-xl text-yellow-500 shadow-lg border border-[#333] animate-pulse">
              <Hand size={24} fill="currentColor" />
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
            <div className="bg-[#121212]/80 backdrop-blur-md pl-1.5 pr-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg border border-[#333]">
              <img src="/avatars/user1.png" alt="avatar" className="w-6 h-6 rounded-full bg-[#2a2a2a]" />
              <span>{userName} (You)</span>
              {!isMicOn && <MicOff size={14} className="text-red-400"/>}
            </div>
          </div>
          {popoutStates['local'] && (
              <div className="absolute bottom-1 right-1 pointer-events-none opacity-50 bg-[#121212] p-0.5 rounded">
                 <Move size={12} />
              </div>
          )}
        </div>

        {/* Remote Videos */}
        {participantIds.map((id) => (
          <div key={id} 
            className={popoutStates[id] ? "fixed z-50 w-72 md:w-96 aspect-video bg-[#1c1c1c] cursor-move shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border-2 border-[#0B5CFF] resize overflow-auto" : "relative bg-[#1c1c1c] rounded-xl overflow-hidden aspect-[3/4] md:aspect-video shadow-2xl transition-all border border-[#333]"}
            style={popoutStates[id] ? { 
                left: drags[id]?.x ?? (typeof window !== 'undefined' ? window.innerWidth/2 - 192 : 50), 
                top: drags[id]?.y ?? (typeof window !== 'undefined' ? window.innerHeight/2 - 100 : 50) 
            } : {}}
            onPointerDown={(e) => {
                initLocalPos(id, window.innerWidth/2 - 192, window.innerHeight/2 - 100)
                handlePointerDown(e, id)
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {popoutStates[id] && (
               <div className="absolute top-2 right-2 flex gap-2 z-20 pointer-events-auto">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setPopoutStates({...popoutStates, [id]: false}) }} 
                   className="bg-[#2a2a2a]/90 hover:bg-neutral-600 p-1.5 rounded text-white shadow"
                 >
                    <Minimize2 size={14} />
                 </button>
               </div>
            )}
            {!popoutStates[id] && (
               <button 
                 onClick={(e) => { e.stopPropagation(); setPopoutStates({...popoutStates, [id]: true}); initLocalPos(id, window.innerWidth/2 - 192, window.innerHeight/2 - 100); }} 
                 className="absolute top-4 left-4 bg-[#2a2a2a]/80 hover:bg-[#0B5CFF] backdrop-blur-sm p-1.5 rounded-lg text-white shadow-lg transition-colors pointer-events-auto z-10"
                 title="Pop out / Drag"
               >
                  <MonitorUp size={16} />
               </button>
            )}
            <video
              ref={(el) => {
                if (el) remoteVideosRef.current[id] = el
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover pointer-events-none"
            />
            {handRaises[id] && (
              <div className="absolute top-4 right-4 bg-[#1c1c1c]/80 backdrop-blur-sm p-2 rounded-xl text-yellow-500 shadow-lg border border-[#333] animate-pulse">
                <Hand size={24} fill="currentColor" />
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
              <div className="bg-[#121212]/80 backdrop-blur-md pl-1.5 pr-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg border border-[#333]">
                <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${participantNames[id] || id}&backgroundColor=2a2a2a`} alt="avatar" className="w-6 h-6 rounded-full bg-[#2a2a2a]" />
                <span>{participantNames[id] || "Participant"}</span>
              </div>
            </div>
            {popoutStates[id] && (
                <div className="absolute bottom-1 right-1 pointer-events-none opacity-50 bg-[#121212] p-0.5 rounded">
                   <Move size={12} />
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoomGrid
