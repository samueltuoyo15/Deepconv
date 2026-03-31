import { useNavigate } from "react-router-dom"
import { Video, VideoOff, Mic, MicOff, Hand, PhoneMissed, MessageSquare, Circle, MonitorUp } from "lucide-react"
import { useRoomStore } from '../store/useRoomStore'

type Props = {
  toggleMic: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  toggleHandRaise: () => void;
  toggleRecording: () => void;
}

const RoomControls = ({ toggleMic, toggleVideo, toggleScreenShare, toggleHandRaise, toggleRecording }: Props) => {
  const navigate = useNavigate()
  const { 
    isMicOn, isVideoOn, isScreenSharing, isHandRaised, isRecording, 
    isChatOpen, setIsChatOpen, setIsChatMinimized, messages 
  } = useRoomStore()

  return (
    <footer className="fixed bottom-3 w-auto left-1/2 -translate-x-1/2 px-5 py-2 bg-[#1c1c1c]/90 backdrop-blur-xl border border-[#333] rounded-[2rem] shadow-2xl z-50 transition-all flex items-center justify-center">
      <div className="flex w-auto justify-center items-center gap-2 sm:gap-6">
        
        <button onClick={toggleMic} className="flex flex-col items-center gap-1.5 group">
          <div className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-[#2a2a2a] hover:bg-[#333] text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
            {isMicOn ? <Mic size={22} fill="currentColor" /> : <MicOff size={22} />}
          </div>
          <span className="text-xs font-medium text-[#a0a0a0] group-hover:text-white transition-colors">Mic</span>
        </button>
        
        <button onClick={toggleVideo} className="flex flex-col items-center gap-1.5 group">
          <div className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-[#2a2a2a] hover:bg-[#333] text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
            {isVideoOn ? <Video size={22} fill="currentColor" /> : <VideoOff size={22} />}
          </div>
          <span className="text-xs font-medium text-[#a0a0a0] group-hover:text-white transition-colors">Video</span>
        </button>
        
        <button onClick={toggleScreenShare} className="flex flex-col items-center gap-1.5 group relative">
          <div className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-[#0B5CFF] text-white shadow-[0_0_15px_rgb(11,92,255,0.4)] animate-pulse' : 'bg-[#2a2a2a] hover:bg-[#333] text-white'}`}>
             <MonitorUp size={22} />
          </div>
          <span className="text-xs font-medium text-[#0B5CFF] md:text-[#a0a0a0] group-hover:text-white transition-colors">{isScreenSharing ? "Sharing" : "Share"}</span>
        </button>

        <button onClick={toggleHandRaise} className="flex flex-col items-center gap-1.5 group">
          <div className={`p-4 rounded-full transition-all ${isHandRaised ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-[#2a2a2a] hover:bg-[#333] text-white'}`}>
            <Hand size={22} fill={isHandRaised ? "currentColor" : "none"} />
          </div>
          <span className="text-xs font-medium text-[#a0a0a0] group-hover:text-white transition-colors">Raise</span>
        </button>
        
        <button onClick={toggleRecording} className="flex flex-col items-center gap-1.5 group relative">
          <div className={`p-4 rounded-full transition-all relative ${isRecording ? 'bg-red-500 text-white shadow-[0_0_15px_rgb(239,68,68,0.5)] animate-pulse' : 'bg-[#2a2a2a] hover:bg-[#333] text-white'}`}>
            <Circle size={22} fill={isRecording ? "currentColor" : "none"} />
            {isRecording && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-800 rounded-full border border-[#1c1c1c]"></span>}
          </div>
          <span className="text-xs font-medium text-[#a0a0a0] group-hover:text-white transition-colors">Record</span>
        </button>
        
        <div className="w-px h-8 bg-[#333] mx-1 hidden sm:block"></div>
        
        <button onClick={() => { setIsChatOpen(!isChatOpen); setIsChatMinimized(false); }} className="flex flex-col items-center gap-1.5 group relative">
          <div className={`p-4 rounded-full transition-all ${isChatOpen ? 'bg-[#0B5CFF] text-white shadow-[0_0_15px_rgb(11,92,255,0.3)]' : 'bg-[#2a2a2a] hover:bg-[#333] text-white'}`}>
             <MessageSquare size={22} fill={isChatOpen ? "currentColor" : "none"} />
             {!isChatOpen && messages.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1c1c1c]"></span>}
          </div>
          <span className="text-xs font-medium text-[#0B5CFF] md:text-[#a0a0a0] group-hover:text-white transition-colors">Chat</span>
        </button>
        
        <div className="w-px h-8 bg-[#333] mx-1"></div>
        
        <button onClick={() => navigate("/")} className="px-6 py-4 rounded-[1.5rem] bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg flex items-center justify-center -mt-5">
           <PhoneMissed size={22} fill="currentColor" />
        </button>
      </div>
    </footer>
  )
}

export default RoomControls
