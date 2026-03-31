import { useState, useRef, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import { Video, X, Copy, Share2, Plus, Terminal } from "lucide-react"
import JoinMeet from "../Components/JoinMeet"
import Header from "../Components/Header"
import { v4 as uuidv4 } from "uuid"

const CreateMeet = () => {
  const [isCreateNewMeeting, setIsCreateNewMeeting] = useState(false)
  const [createNewMeetingModal, setCreateNewMeetingModal] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [toggleJoinMeeting, setToggleJoinMeeting] = useState<boolean>(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const toggleCreateNewMeeting = () => {
    const newRoomId = `meet-${uuidv4()}`
    setRoomId(newRoomId)
    setIsCreateNewMeeting(true)
  }

  const openCreateMeetingModal = () => {
    setCreateNewMeetingModal(true)
    setIsCreateNewMeeting(false)
  }

  const closeAllModals = () => {
    setCreateNewMeetingModal(false)
    setIsCreateNewMeeting(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!createNewMeetingModal && isCreateNewMeeting && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsCreateNewMeeting(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isCreateNewMeeting, createNewMeetingModal])

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans overflow-hidden flex">
      <Header />
      
      <main className="flex-1 md:ml-20 flex flex-col p-4 md:p-8 pt-24 md:pt-8 items-center justify-center w-full min-h-screen">
        
        <div className="max-w-2xl w-full flex flex-col items-center justify-center -mt-10">
          
          <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl p-10 w-full text-center shadow-2xl relative overflow-hidden">
             
             <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
             
             <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Collaboration Hub</h2>
             <p className="text-[#a0a0a0] mb-10 max-w-sm mx-auto">Create a new meeting to get a secure link, or join an existing session directly.</p>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button
                  onClick={toggleCreateNewMeeting}
                  className="flex items-center justify-center gap-3 bg-[#0B5CFF] text-white font-semibold py-4 w-full rounded-xl hover:bg-[#1C68FF] transition-colors"
                >
                  <Plus size={20} /> New Meeting
                </button>
                <button
                  onClick={() => setToggleJoinMeeting((prev) => !prev)}
                  className="flex items-center justify-center gap-3 bg-[#2a2a2a] border border-[#444] text-white font-semibold py-4 w-full rounded-xl hover:bg-[#333] transition-colors"
                >
                  Join with Code
                </button>
             </div>
          </div>
          
        </div>
      </main>

      {/* Backdrop */}
      {(isCreateNewMeeting || createNewMeetingModal) && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={closeAllModals}
        />
      )}

      {/* Bottom Sheet Modal / Menu Dropdown */}
      {isCreateNewMeeting && !createNewMeetingModal && (
        <div
          ref={modalRef}
          className="fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 left-0 right-0 p-6 bg-[#1c1c1c] border border-[#333] rounded-t-2xl md:rounded-2xl z-50 shadow-2xl md:w-full md:max-w-md animate-slide-up md:animate-none"
        >
          <div className="flex justify-between items-center mb-6 hidden md:flex">
             <h3 className="font-bold text-lg text-white">Meeting Options</h3>
          </div>
          <div 
            onClick={openCreateMeetingModal} 
            className="flex items-center mb-3 cursor-pointer hover:bg-[#2a2a2a] p-4 rounded-xl transition border border-transparent hover:border-[#444]"
          >
            <div className="bg-[#121212] p-3 rounded-lg mr-4 border border-[#333]"><Terminal className="text-[#a0a0a0]" size={20} /></div>
            <div className="flex flex-col">
               <span className="text-base font-bold text-white">Generate link</span>
               <span className="text-xs text-[#a0a0a0] mt-0.5">Create a meeting code for later</span>
            </div>
          </div>
          <RouterLink 
            to={`/meet/room/${roomId}`} 
            className="flex items-center cursor-pointer hover:bg-[#2a2a2a] p-4 rounded-xl transition border border-transparent hover:border-[#444]"
          >
            <div className="bg-[#0B5CFF]/20 p-3 rounded-lg mr-4 border border-[#0B5CFF]/30"><Video className="text-[#0B5CFF]" size={20} /></div>
            <div className="flex flex-col">
               <span className="text-base font-bold text-white">Start instant meeting</span>
               <span className="text-xs text-[#a0a0a0] mt-0.5">Jump directly into a new room</span>
            </div>
          </RouterLink>
        </div>
      )}

      {/* Center Modal for Meeting Link */}
      {createNewMeetingModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-sm bg-[#1c1c1c] border border-[#333] rounded-2xl p-6 z-50 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Meeting Code</h2>
            <button className="p-1.5 rounded bg-[#2a2a2a] hover:bg-[#333] transition" onClick={closeAllModals}>
              <X className="text-[#a0a0a0] hover:text-white" size={18} />
            </button>
          </div>
          <p className="text-sm mb-6 text-[#a0a0a0]">
            Share this link with your guests. Keep it secure as anyone with the link can join.
          </p>
          <div className="flex justify-between items-center px-4 py-3 bg-[#121212] border border-[#444] rounded-lg">
            <span className="truncate text-white font-medium text-sm">{roomId}</span>
            <Copy
              className="cursor-pointer text-[#a0a0a0] hover:text-white transition ml-3"
              onClick={() => {
                if (roomId) {
                  navigator.clipboard.writeText(`${window.location.origin}/meet/room/${roomId}`)
                  alert("Meeting link copied to clipboard!")
                }
              }}
              size={18}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <RouterLink
              to={`/meet/room/${roomId}`}
              className="flex-1 flex items-center justify-center bg-[#0B5CFF] hover:bg-[#1C68FF] text-white font-semibold rounded-lg py-3 transition-colors text-sm"
            >
              <Video className="mr-2" size={16} />
              Join
            </RouterLink>
            <button
              onClick={() => {
                if (roomId) {
                  const shareData = {
                     title: "Join my meeting",
                     text: `Join code: ${roomId}`,
                     url: `${window.location.origin}/meet/room/${roomId}`,
                  }
                  if (navigator.share) {
                    navigator.share(shareData)
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/meet/room/${roomId}`)
                    alert("Link copied!")
                  }
                }
              }}
              className="flex-1 flex items-center justify-center bg-[#2a2a2a] border border-[#444] hover:bg-[#333] text-white font-semibold rounded-lg py-3 transition-colors text-sm"
            >
              <Share2 className="mr-2" size={16} />
              Share
            </button>
          </div>
        </div>
      )}

      <JoinMeet toggle={toggleJoinMeeting} setToggle={setToggleJoinMeeting} />
    </div>
  )
}

export default CreateMeet
