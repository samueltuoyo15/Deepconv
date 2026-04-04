import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Video, Calendar, Plus, Settings, Sparkles } from 'lucide-react';
import SettingsModal from '../Components/SettingsModal';

const Main = () => {
  const currentDate = new Date();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans overflow-auto flex flex-col">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <main className="flex-1 w-full flex flex-col p-4 md:p-8 pb-32">
        <div className="flex justify-end gap-3 mb-6 md:mb-10 w-full items-center">
          <div className="relative flex-1 md:flex-none md:w-64">
            <input type="text" placeholder="Search" className="bg-[#1c1c1c] border border-[#333] text-sm text-white rounded-full px-4 py-1.5 w-full focus:outline-none focus:border-[#0B5CFF]"/>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] border border-[#333] rounded-full transition-colors shrink-0">
            <Settings size={20} />
          </button>
          <img src="/avatars/user1.png" alt="Profile" className="w-8 h-8 rounded-full bg-white/10 border border-[#444] object-cover shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 h-full max-w-6xl w-full mx-auto">
          <div className="flex flex-col gap-6">
            <div className="bg-[#1c1c1c] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden h-64 border border-[#333]">
              <div className="z-10 text-center">
                <h2 className="text-5xl font-light mb-1">{currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</h2>
                <p className="text-[#a0a0a0]">{currentDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric'})}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <Link to="/meet/new" className="bg-[#FF7A00] hover:bg-[#FF8C1F] text-white p-4 rounded-xl flex items-center justify-center flex-col gap-3 transition-colors">
                <Video size={30}/>
                <span className="text-xs font-semibold">New Meeting</span>
              </Link>
              <Link to="/meet/new" className="bg-[#0B5CFF] hover:bg-[#1C68FF] text-white p-4 rounded-xl flex items-center justify-center flex-col gap-3 transition-colors">
                <div className="bg-white/20 p-2 rounded-lg"><Plus size={20}/></div>
                <span className="text-xs font-semibold">Join</span>
              </Link>
            </div>
          </div>

          <div className="bg-[#1c1c1c] rounded-2xl border border-[#333] flex flex-col">
            <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#212121] rounded-t-2xl">
              <h3 className="font-semibold text-sm">Upcoming Meetings</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#a0a0a0]">
              <Calendar size={48} className="text-[#444] mb-4" strokeWidth={1}/>
              <p className="text-sm">No upcoming meetings today</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-br from-[#0B5CFF]/10 to-[#1c1c1c] rounded-2xl border border-[#0B5CFF]/30 p-6 md:p-8 max-w-6xl w-full mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Why DeepConv?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-[#1c1c1c]/80 backdrop-blur-sm rounded-xl p-5 border border-[#333]">
              <div className="w-12 h-12 bg-[#0B5CFF]/20 rounded-lg flex items-center justify-center mb-4">
                <Video size={24} className="text-[#0B5CFF]" />
              </div>
              <h4 className="text-white font-semibold mb-2">No Time Limits</h4>
              <p className="text-sm text-[#a0a0a0]">Meet for as long as you need. No 40-minute restrictions or premium plans required.</p>
            </div>
            <div className="bg-[#1c1c1c]/80 backdrop-blur-sm rounded-xl p-5 border border-[#333]">
              <div className="w-12 h-12 bg-[#0B5CFF]/20 rounded-lg flex items-center justify-center mb-4">
                <Settings size={24} className="text-[#0B5CFF]" />
              </div>
              <h4 className="text-white font-semibold mb-2">Fully Decentralized</h4>
              <p className="text-sm text-[#a0a0a0]">Peer-to-peer connections. Your data stays between you and your participants.</p>
            </div>
            <div className="bg-[#1c1c1c]/80 backdrop-blur-sm rounded-xl p-5 border border-[#333]">
              <div className="w-12 h-12 bg-[#0B5CFF]/20 rounded-lg flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-[#0B5CFF]" />
              </div>
              <h4 className="text-white font-semibold mb-2">No Sign-Up Required</h4>
              <p className="text-sm text-[#a0a0a0]">Jump into meetings instantly. No accounts, no emails, no hassle.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Main;
