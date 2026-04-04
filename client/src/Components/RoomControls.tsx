import { useNavigate } from "react-router-dom"
import { Video, VideoOff, Mic, MicOff, Hand, PhoneMissed, MessageSquare, Circle, MonitorUp, Settings } from "lucide-react"
import { useRoomStore } from '../store/useRoomStore'

type Props = {
  toggleMic: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  toggleHandRaise: () => void;
  toggleRecording: () => void;
  onOpenSettings: () => void;
}

const RoomControls = ({ toggleMic, toggleVideo, toggleScreenShare, toggleHandRaise, toggleRecording, onOpenSettings }: Props) => {
  const navigate = useNavigate()
  const { 
    isMicOn, isVideoOn, isScreenSharing, isHandRaised, isRecording, 
    isChatOpen, setIsChatOpen, setIsChatMinimized, messages 
  } = useRoomStore()

  return (
    <footer className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 bg-[#1c1c1c]/90 backdrop-blur-xl border border-[#333] rounded-[2rem] shadow-2xl z-[60] transition-all flex items-center justify-center pointer-events-auto max-w-[calc(100vw-1rem)]">
      <div className="flex w-auto justify-center items-center gap-0.5 sm:gap-1 md:gap-3 lg:gap-6 text-white overflow-x-auto scrollbar-hide">
        
        <button onClick={toggleMic} className="flex flex-col items-center gap-0.5 sm:gap-1 group shrink-0">
          <div className={`p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all ${isMicOn ? 'bg-[#2a2a2a] hover:bg-[#333] text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
            {isMicOn ? <Mic size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" fill="currentColor" /> : <MicOff size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" />}
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-[#a0a0a0] group-hover:text-white transition-colors hidden md:block">Mic</span>
        </button>
        
        <button onClick={toggleVideo} className="flex flex-col items-center gap-0.5 sm:gap-1 group shrink-0">
          <div className={`p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all ${isVideoOn ? 'bg-[#2a2a2a] hover:bg-[#333] text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
            {isVideoOn ? <Video size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" fill="currentColor" /> : <VideoOff size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" />}
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-[#a0a0a0] group-hover:text-white transition-colors hidden md:block">Video</span>
        </button>
        
        <button onClick={toggleScreenShare} className="flex flex-col items-center gap-0.5 sm:gap-1 group relative shrink-0" title={isScreenSharing ? "Stop sharing screen" : "Share your screen"}>
          <div className={`p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all ${isScreenSharing ? 'bg-[#0B5CFF] text-white shadow-[0_0_15px_rgb(11,92,255,0.4)] animate-pulse' : 'bg-[#2a2a2a] hover:bg-[#333] text-white'}`}>
             <MonitorUp size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" />
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-[#0B5CFF] lg:text-[#a0a0a0] group-hover:text-white transition-colors hidden md:block">{isScreenSharing ? "Sharing" : "Share"}</span>
        </button>

        <button onClick={toggleHandRaise} className="flex flex-col items-center gap-0.5 sm:gap-1 group shrink-0">
          <div className={`p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all ${isHandRaised ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-[#2a2a2a] hover:bg-[#333] text-white'}`}>
            <Hand size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" fill={isHandRaised ? "currentColor" : "none"} />
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-[#a0a0a0] group-hover:text-white transition-colors hidden md:block">Raise</span>
        </button>
        
        <button onClick={toggleRecording} className="flex flex-col items-center gap-0.5 sm:gap-1 group relative shrink-0" title={isRecording ? "Stop recording" : "Record meeting"}>
          <div className={`p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all relative ${isRecording ? 'bg-red-500 text-white shadow-[0_0_15px_rgb(239,68,68,0.5)] animate-pulse' : 'bg-[#2a2a2a] hover:bg-[#333] text-white'}`}>
            <Circle size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" fill={isRecording ? "currentColor" : "none"} />
            {isRecording && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-800 rounded-full border border-[#1c1c1c]"></span>}
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-[#a0a0a0] group-hover:text-white transition-colors hidden md:block">Record</span>
        </button>
        
        <div className="w-px h-5 sm:h-6 md:h-8 bg-[#333] mx-0.5 sm:mx-1"></div>
        
        <button onClick={() => { setIsChatOpen(!isChatOpen); setIsChatMinimized(false); }} className="flex flex-col items-center gap-0.5 sm:gap-1 group relative shrink-0">
          <div className={`p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all ${isChatOpen ? 'bg-[#0B5CFF] text-white shadow-[0_0_15px_rgb(11,92,255,0.3)]' : 'bg-[#2a2a2a] hover:bg-[#333] text-white'}`}>
             <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" fill={isChatOpen ? "currentColor" : "none"} />
             {!isChatOpen && messages.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-[#1c1c1c]"></span>}
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-[#0B5CFF] lg:text-[#a0a0a0] group-hover:text-white transition-colors hidden md:block">Chat</span>
        </button>
        
        <button onClick={onOpenSettings} className="flex flex-col items-center gap-0.5 sm:gap-1 group relative shrink-0">
          <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full transition-all bg-[#2a2a2a] hover:bg-[#333] text-white">
             <Settings size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" />
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-[#a0a0a0] group-hover:text-white transition-colors hidden md:block">Settings</span>
        </button>
        
        <div className="w-px h-5 sm:h-6 md:h-8 bg-[#333] mx-0.5 sm:mx-1"></div>
        
        <button onClick={() => navigate("/")} className="px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-[1.5rem] bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg flex items-center justify-center shrink-0">
           <PhoneMissed size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" fill="currentColor" />
        </button>
      </div>
    </footer>
  )
}

export default RoomControls
