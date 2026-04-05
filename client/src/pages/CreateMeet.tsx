import { useState, useRef, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import { Video, X, Copy, Share2, Plus, Terminal, Link } from "lucide-react"
import JoinMeet from "../Components/JoinMeet"

const CreateMeet = () => {
  const [isCreateNewMeeting, setIsCreateNewMeeting] = useState(false)
  const [createNewMeetingModal, setCreateNewMeetingModal] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [toggleJoinMeeting, setToggleJoinMeeting] = useState<boolean>(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const toggleCreateNewMeeting = () => {
    const newRoomId = Math.random().toString(36).slice(2, 7)
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
    <div className="bg-[#0c0c0f] min-h-screen text-white font-sans overflow-hidden flex relative selection:bg-[#0B5CFF]/30">
      <main className="flex-1 flex flex-col p-6 lg:p-12 max-w-[1200px] mx-auto w-full min-h-screen justify-center items-center relative z-10">
        
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
          
          <div className="flex-1 flex flex-col items-start max-w-xl shrink-0">
             
             <h2 className="text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white">
                Deep Conv
             </h2>

             <p className="text-[#a0aab2] mb-10 text-[17px] font-medium leading-relaxed max-w-md">
                Experience decentralized, instant video meetings with zero friction. No sign-ups, no passwords, and no personal data stored. Just generate a link and jump in with anyone.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <button
                  onClick={toggleCreateNewMeeting}
                  className="flex items-center justify-center gap-3 bg-[#0B5CFF] text-white font-semibold py-3.5 px-8 w-full sm:w-auto rounded-xl hover:bg-[#1A6DFF] transition-colors"
                >
                  <Plus size={20} />
                  <span>New Meeting</span>
                </button>
                <button
                  onClick={() => setToggleJoinMeeting((prev) => !prev)}
                  className="flex items-center justify-center gap-3 bg-[#171a22] border border-[#2B3142] text-white font-semibold py-3.5 px-8 w-full sm:w-auto rounded-xl hover:bg-[#202633] transition-colors"
                >
                  <span>Join with Code</span>
                </button>
             </div>
          </div>

          <div className="flex-1 w-full flex justify-center relative select-none pointer-events-none mt-8 md:mt-0">
              <img src="/Remote meeting-rafiki.png" alt="Remote Meeting Illustration" className="w-full max-w-[550px] object-contain relative z-10" />
          </div>
          
        </div>
      </main>

      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isCreateNewMeeting || createNewMeetingModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeAllModals}
      />

      {isCreateNewMeeting && !createNewMeetingModal && (
        <div
          ref={modalRef}
          className="fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 left-0 right-0 p-6 bg-[#10131a] border border-[#2B3142] rounded-t-2xl md:rounded-2xl z-50 shadow-2xl md:w-full md:max-w-md animate-slide-up md:animate-none"
        >
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-white">Meeting Options</h3>
             <button onClick={closeAllModals} className="p-1.5 rounded bg-[#1a1f2b] hover:bg-[#252a38] transition-colors">
               <X size={18} className="text-[#a0aab2]" />
             </button>
          </div>
          <div className="flex flex-col gap-2">
             <div 
               onClick={openCreateMeetingModal} 
               className="flex items-center p-4 cursor-pointer hover:bg-[#1a1f2b] rounded-xl transition-colors border border-transparent hover:border-[#2B3142]"
             >
               <div className="bg-[#171a22] p-3 rounded-lg mr-4 border border-[#2B3142]"><Terminal className="text-[#a0aab2]" size={20} /></div>
               <div className="flex flex-col">
                  <span className="text-base font-semibold text-white">Generate link</span>
                  <span className="text-sm text-[#a0aab2] mt-0.5">Create a meeting code for later</span>
               </div>
             </div>
             <RouterLink 
               to={`/meet/room/${roomId}`} 
               className="flex items-center p-4 cursor-pointer hover:bg-[#1a1f2b] rounded-xl transition-colors border border-transparent hover:border-[#2B3142]"
             >
               <div className="bg-[#0B5CFF]/20 p-3 rounded-lg mr-4 border border-[#0B5CFF]/30"><Video className="text-[#0B5CFF]" size={20} /></div>
               <div className="flex flex-col">
                  <span className="text-base font-semibold text-white">Start instant meeting</span>
                  <span className="text-sm text-[#a0aab2] mt-0.5">Jump directly into a new room</span>
               </div>
             </RouterLink>
          </div>
        </div>
      )}

      {createNewMeetingModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] bg-[#10131a] border border-[#2B3142] rounded-2xl p-6 z-50 shadow-2xl">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-white">Meeting Link</h2>
            <button className="p-1.5 rounded bg-[#1a1f2b] hover:bg-[#252a38] text-[#A0AAB2] transition-colors" onClick={closeAllModals}>
              <X size={18} />
            </button>
          </div>
          <p className="text-sm mb-6 text-[#a0aab2] leading-relaxed">
            Share this link with your guests. Keep it secure as anyone with the link can join.
          </p>
          <div className="flex items-center justify-between px-4 py-3 bg-[#0c0c0f] border border-[#2B3142] rounded-xl mb-6">
            <span className="truncate text-white font-mono text-sm">{window.location.origin}/meet/room/{roomId}</span>
            <button
              className="ml-3 p-1.5 hover:text-white text-[#a0aab2] transition-colors"
              onClick={() => {
                if (roomId) {
                  navigator.clipboard.writeText(`${window.location.origin}/meet/room/${roomId}`)
                  alert("Meeting link copied to clipboard")
                }
              }}
            >
               <Copy size={18} />
            </button>
          </div>
          <div className="flex gap-3">
            <RouterLink
              to={`/meet/room/${roomId}`}
              className="flex-1 flex items-center justify-center bg-[#0B5CFF] hover:bg-[#1A6DFF] text-white font-semibold rounded-xl py-3 transition-colors"
            >
              <Video className="mr-2" size={18} />
              <span>Join</span>
            </RouterLink>
            <button
              onClick={() => {
                if (roomId) {
                  const shareData = {
                     title: "Join DeepConv Meeting",
                     text: `Join my secure meeting.`,
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
              className="flex-none flex items-center justify-center bg-[#171a22] border border-[#2B3142] hover:bg-[#202633] text-white font-semibold rounded-xl px-5 transition-colors"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      )}

      <JoinMeet toggle={toggleJoinMeeting} setToggle={setToggleJoinMeeting} />
    </div>
  )
}

export default CreateMeet
