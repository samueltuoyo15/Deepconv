import React, { useRef, useState } from 'react'
import { Hand, MicOff, Maximize2, Minimize2, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight } from 'lucide-react'
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

  const [isDragging, setIsDragging] = useState(false)

  const dragRef = useRef<{
    id: string | null
    startX: number
    startY: number
    initialX: number
    initialY: number
    initialW: number
    initialH: number
    isResizing: boolean
    corner: string
  }>({ id: null, startX: 0, startY: 0, initialX: 0, initialY: 0, initialW: 384, initialH: 216, isResizing: false, corner: '' })

  const handlePointerDown = (e: React.PointerEvent, id: string, isResize = false, corner = '') => {
    if (!popoutStates[id]) return
    e.stopPropagation()
    e.preventDefault()
    const current = drags[id] || { x: 50, y: 50, w: 384, h: 216 }
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: current.x,
      initialY: current.y,
      initialW: current.w || 384,
      initialH: current.h || 216,
      isResizing: isResize,
      corner
    }
    setIsDragging(true)
    const overlay = document.getElementById('room-drag-overlay')
    if (overlay) overlay.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.id) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    const chatWidth = isChatOpen ? 360 : 0
    const controlsHeight = 140
    const headerHeight = 80

    if (dragRef.current.isResizing) {
      let newX = dragRef.current.initialX
      let newY = dragRef.current.initialY
      let newW = dragRef.current.initialW
      let newH = dragRef.current.initialH
      const corner = dragRef.current.corner
      const maxHeight = window.innerHeight - controlsHeight - headerHeight

      if (corner.includes('right')) {
        newW = Math.max(200, Math.min(window.innerWidth - chatWidth - dragRef.current.initialX - 20, dragRef.current.initialW + dx))
      }
      if (corner.includes('left')) {
        const maxDx = dragRef.current.initialW - 200
        const constrainedDx = Math.max(-dragRef.current.initialX + 20, Math.min(maxDx, dx))
        newW = dragRef.current.initialW - constrainedDx
        newX = dragRef.current.initialX + constrainedDx
      }
      if (corner.includes('bottom')) {
        newH = Math.max(150, Math.min(maxHeight - dragRef.current.initialY, dragRef.current.initialH + dy))
      }
      if (corner.includes('top')) {
        const maxDy = dragRef.current.initialH - 150
        const constrainedDy = Math.max(-dragRef.current.initialY + headerHeight, Math.min(maxDy, dy))
        newH = Math.min(maxHeight, dragRef.current.initialH - constrainedDy)
        newY = dragRef.current.initialY + constrainedDy
      }

      setDrags({ ...drags, [dragRef.current.id]: { x: newX, y: newY, w: newW, h: newH } })
    } else {
      const id = dragRef.current.id
      const maxX = window.innerWidth - chatWidth - (drags[id]?.w || 384)
      const maxY = window.innerHeight - controlsHeight - (drags[id]?.h || 216)
      const newX = Math.max(20, Math.min(maxX, dragRef.current.initialX + dx))
      const newY = Math.max(headerHeight, Math.min(maxY, dragRef.current.initialY + dy))
      setDrags({ ...drags, [id]: { ...drags[id], x: newX, y: newY } })
    }
  }

  const handlePointerUp = () => {
    if (dragRef.current.id) {
      const id = dragRef.current.id
      const currentPos = drags[id]
      localStorage.setItem(`drags-${id}`, JSON.stringify(currentPos))
      dragRef.current.id = null
    }
    setIsDragging(false)
  }

  const initLocalPos = (id: string, defaultX: number, defaultY: number) => {
    if (!drags[id]) {
      const saved = localStorage.getItem(`drags-${id}`)
      if (saved) {
        setDrags({ ...drags, [id]: JSON.parse(saved) })
      } else {
        const defaultW = isScreenSharing ? 600 : 384
        const defaultH = isScreenSharing ? 338 : 216
        setDrags({ ...drags, [id]: { x: defaultX, y: defaultY, w: defaultW, h: defaultH } })
      }
    }
  }

  const renderVideoTile = (id: string, content: React.ReactNode) => {
    const isPopped = !!popoutStates[id]
    return (
      <div
        key={id}
        className={isPopped
          ? "fixed z-50 bg-[#1c1c1c] shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border-2 border-[#0B5CFF]"
          : "relative bg-[#1c1c1c] rounded-xl overflow-hidden aspect-video shadow-2xl transition-all border border-[#333]"
        }
        style={isPopped ? {
          left: drags[id]?.x ?? (window.innerWidth / 2 - (isScreenSharing ? 300 : 192)),
          top: drags[id]?.y ?? (window.innerHeight / 2 - (isScreenSharing ? 169 : 100)),
          width: drags[id]?.w ?? (isScreenSharing ? 600 : 384),
          height: Math.min(drags[id]?.h ?? (isScreenSharing ? 338 : 216), window.innerHeight - 220),
          cursor: 'move'
        } : {}}
        onPointerDown={(e) => {
          if (!isPopped) return
          initLocalPos(id, window.innerWidth / 2 - 192, window.innerHeight / 2 - 100)
          handlePointerDown(e, id)
        }}
      >
        {content}
        {isPopped && (
          <>
            <div className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize bg-[#0B5CFF]/80 hover:bg-[#0B5CFF] pointer-events-auto rounded-tl-xl flex items-center justify-center transition-colors"
              onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, id, true, 'top-left') }}>
              <ArrowUpLeft size={12} className="text-white" />
            </div>
            <div className="absolute top-0 right-0 w-6 h-6 cursor-nesw-resize bg-[#0B5CFF]/80 hover:bg-[#0B5CFF] pointer-events-auto rounded-tr-xl flex items-center justify-center transition-colors"
              onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, id, true, 'top-right') }}>
              <ArrowUpRight size={12} className="text-white" />
            </div>
            <div className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize bg-[#0B5CFF]/80 hover:bg-[#0B5CFF] pointer-events-auto rounded-bl-xl flex items-center justify-center transition-colors"
              onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, id, true, 'bottom-left') }}>
              <ArrowDownLeft size={12} className="text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize bg-[#0B5CFF]/80 hover:bg-[#0B5CFF] pointer-events-auto rounded-br-xl flex items-center justify-center transition-colors"
              onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, id, true, 'bottom-right') }}>
              <ArrowDownRight size={12} className="text-white" />
            </div>
          </>
        )}
      </div>
    )
  }

  const localContent = (
    <>
      {popoutStates['local'] && (
        <div className="absolute top-2 right-2 flex gap-2 z-20 pointer-events-auto">
          <button
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault() }}
            onClick={(e) => {
              e.stopPropagation()
              const newStates = { ...popoutStates }
              delete newStates.local
              setPopoutStates(newStates)
            }}
            className="bg-[#2a2a2a]/90 hover:bg-red-600 p-1.5 rounded text-white shadow"
          >
            <Minimize2 size={14} />
          </button>
        </div>
      )}
      {!popoutStates['local'] && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setPopoutStates({ ...popoutStates, local: true })
            initLocalPos('local', window.innerWidth / 2 - (isScreenSharing ? 300 : 192), window.innerHeight / 2 - (isScreenSharing ? 169 : 100))
          }}
          className="absolute top-4 left-4 bg-[#2a2a2a]/80 hover:bg-[#0B5CFF] backdrop-blur-sm p-1.5 rounded-lg text-white shadow-lg transition-colors pointer-events-auto z-10"
        >
          <Maximize2 size={16} />
        </button>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${!isVideoOn && !isScreenSharing ? 'hidden' : ''} ${popoutStates['local'] ? 'pointer-events-none' : ''}`}
      />
      {!isVideoOn && !isScreenSharing && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1c1c1c]">
          <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=You&backgroundColor=0B5CFF`} alt="Avatar" className="w-32 h-32 rounded-full shadow-2xl border-4 border-[#333]" />
        </div>
      )}
      {isScreenSharing && (
        <div className="absolute top-4 right-4 bg-[#0B5CFF] px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg animate-pulse z-20 pointer-events-none">
          Presenting
        </div>
      )}
      {isHandRaised && (
        <div className="absolute top-14 right-4 bg-[#1c1c1c]/80 backdrop-blur-sm p-2 rounded-xl text-yellow-500 shadow-lg border border-[#333] animate-pulse pointer-events-none">
          <Hand size={24} fill="currentColor" />
        </div>
      )}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        <div className="bg-[#121212]/80 backdrop-blur-md pl-1.5 pr-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg border border-[#333] text-white">
          <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=You&backgroundColor=0B5CFF`} alt="avatar" className="w-6 h-6 rounded-full bg-[#2a2a2a]" />
          <span>{userName} (You)</span>
          {!isMicOn && <MicOff size={14} className="text-red-400"/>}
        </div>
      </div>
    </>
  )

  return (
    <div className="contents">
      <div
        id="room-drag-overlay"
        className="fixed inset-0 z-[60]"
        style={{ pointerEvents: isDragging ? 'auto' : 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <div
        className="flex-1 flex items-center justify-center transition-all overflow-hidden"
        style={{
          paddingTop: '5rem',
          paddingBottom: '7rem',
          paddingLeft: '1rem',
          paddingRight: isChatOpen ? 'clamp(1rem, 22rem, 22rem)' : '1rem'
        }}
      >
        <div className={`grid gap-3 md:gap-4 w-full h-full ${
          participantIds.length === 0 ? 'grid-cols-1 max-w-md' :
          participantIds.length === 1 ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl' :
          participantIds.length === 2 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {renderVideoTile('local', localContent)}

          {participantIds.map((id) => {
            const remoteContent = (
              <>
                {popoutStates[id] && (
                  <div className="absolute top-2 right-2 flex gap-2 z-20 pointer-events-auto">
                    <button
                      onPointerDown={(e) => { e.stopPropagation(); e.preventDefault() }}
                      onClick={(e) => {
                        e.stopPropagation()
                        const newStates = { ...popoutStates }
                        delete newStates[id]
                        setPopoutStates(newStates)
                      }}
                      className="bg-[#2a2a2a]/90 hover:bg-red-600 p-1.5 rounded text-white shadow"
                    >
                      <Minimize2 size={14} />
                    </button>
                  </div>
                )}
                {!popoutStates[id] && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPopoutStates({ ...popoutStates, [id]: true })
                      initLocalPos(id, window.innerWidth / 2 - (isScreenSharing ? 300 : 192), window.innerHeight / 2 - (isScreenSharing ? 169 : 100))
                    }}
                    className="absolute top-4 left-4 bg-[#2a2a2a]/80 hover:bg-[#0B5CFF] backdrop-blur-sm p-1.5 rounded-lg text-white shadow-lg transition-colors pointer-events-auto z-10"
                  >
                    <Maximize2 size={16} />
                  </button>
                )}
                <video
                  ref={(el) => { if (el) remoteVideosRef.current[id] = el }}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${popoutStates[id] ? 'pointer-events-none' : ''}`}
                />
                {handRaises[id] && (
                  <div className="absolute top-4 right-4 bg-[#1c1c1c]/80 backdrop-blur-sm p-2 rounded-xl text-yellow-500 shadow-lg border border-[#333] animate-pulse pointer-events-none">
                    <Hand size={24} fill="currentColor" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                  <div className="bg-[#121212]/80 backdrop-blur-md pl-1.5 pr-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg border border-[#333] text-white">
                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${participantNames[id] || id}&backgroundColor=2a2a2a`} alt="avatar" className="w-6 h-6 rounded-full bg-[#2a2a2a]" />
                    <span>{participantNames[id] || "Participant"}</span>
                  </div>
                </div>
              </>
            )
            return renderVideoTile(id, remoteContent)
          })}
        </div>
      </div>
    </div>
  )
}

export default RoomGrid
