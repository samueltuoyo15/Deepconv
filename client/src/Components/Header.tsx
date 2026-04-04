import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Home, MessageSquare, Settings, X, Video, Menu, Sparkles, Mic } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SettingsModal from './SettingsModal';

type Props = {
  isSettingsOpen: boolean;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
}

const Header = ({ isSettingsOpen, setIsSettingsOpen }: Props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState(localStorage.getItem('preferredMic') || '');
  const [selectedCam, setSelectedCam] = useState(localStorage.getItem('preferredCamera') || '');
  
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    // devices are now handled by SettingsModal itself
  }, []);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#1c1c1c] z-50 p-4 border-b border-[#333] flex justify-between items-center">
         <img src="/avatars/user1.png" alt="Profile" className="w-8 h-8 rounded-full bg-white/10 border border-[#444] object-cover" />
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-1">
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      <aside className={`fixed left-0 top-0 h-screen w-20 bg-[#1c1c1c] border-r border-[#333] flex flex-col items-center py-4 z-40 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 pt-20' : '-translate-x-full'}`}>

        <nav className="flex flex-col gap-1 w-full flex-1">
          <Link to="/" className={`flex flex-col items-center py-3 w-full hover:bg-[#2a2a2a] transition-colors ${isHome ? 'bg-[#2a2a2a] text-white' : 'text-[#a0a0a0]'}`}>
            <Home size={22} className="mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Home</span>
          </Link>
          
          <button className="flex flex-col items-center py-3 w-full hover:bg-[#2a2a2a] text-[#a0a0a0] transition-colors">
            <MessageSquare size={22} className="mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Team Chat</span>
          </button>
          
          <button className="flex flex-col items-center py-3 w-full hover:bg-[#2a2a2a] text-[#a0a0a0] transition-colors">
            <Sparkles size={22} className="mb-1 text-[#0B5CFF]" />
            <span className="text-[10px] font-medium tracking-wide text-center leading-tight">Smart<br/>Record</span>
          </button>
        </nav>

        <button 
          className="flex flex-col items-center py-3 w-full hover:bg-[#2a2a2a] text-[#a0a0a0] transition-colors mt-auto"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings size={22} />
        </button>
      </aside>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Header;