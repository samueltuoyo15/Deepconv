import Header from '../Components/Header';
import { Link } from 'react-router-dom';
import { Video, Calendar, Plus, ExternalLink, Settings, Clock } from 'lucide-react';

const Main = () => {
  const currentDate = new Date();
  
  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans overflow-hidden flex">

      <Header />
      

      <main className="flex-1 md:ml-20 w-full flex flex-col p-4 md:p-8 pt-24 md:pt-8 min-h-screen">
        

        <div className="hidden md:flex justify-end gap-5 mb-10 w-full items-center">
            <div className="relative w-64">
               <input type="text" placeholder="Search" className="bg-[#1c1c1c] border border-[#333] text-sm text-white rounded-full px-4 py-1.5 w-full focus:outline-none focus:border-[#0B5CFF]"/>
            </div>
            <img src="/avatars/user1.png" alt="Profile" className="w-8 h-8 rounded-full bg-white/10 border border-[#444] object-cover" />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 h-full max-w-6xl w-full mx-auto">

           <div className="flex flex-col gap-6">
              
              <div className="bg-[#1c1c1c] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden h-64 border border-[#333]">
                  <div className="z-10 text-center">
                     <h2 className="text-5xl font-light mb-1">{currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</h2>
                     <p className="text-[#a0a0a0]">{currentDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric'})}</p>
                  </div>
              </div>


              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <Link to="/meet/new" className="bg-[#FF7A00] hover:bg-[#FF8C1F] text-white p-4 rounded-xl flex items-center justify-center flex-col gap-3 transition-colors">
                     <Video size={30}/>
                     <span className="text-xs font-semibold">New Meeting</span>
                  </Link>

                  <Link to="/meet/new" className="bg-[#0B5CFF] hover:bg-[#1C68FF] text-white p-4 rounded-xl flex items-center justify-center flex-col gap-3 transition-colors">
                     <div className="bg-white/20 p-2 rounded-lg"><Plus size={20}/></div>
                     <span className="text-xs font-semibold">Join</span>
                  </Link>
                  
                  <div className="bg-[#0B5CFF] hover:bg-[#1C68FF] text-white p-4 rounded-xl flex items-center justify-center flex-col gap-3 transition-colors cursor-pointer">
                     <div className="bg-white/20 p-2 rounded-lg"><Calendar size={20}/></div>
                     <span className="text-xs font-semibold">Schedule</span>
                  </div>

                  <div className="bg-[#0B5CFF] hover:bg-[#1C68FF] text-white p-4 rounded-xl flex items-center justify-center flex-col gap-3 transition-colors cursor-pointer">
                     <div className="bg-white/20 p-2 rounded-lg"><ExternalLink size={20}/></div>
                     <span className="text-xs font-semibold">Share Screen</span>
                  </div>
              </div>

           </div>


           <div className="bg-[#1c1c1c] rounded-2xl border border-[#333] flex flex-col">
               <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#212121] rounded-t-2xl">
                   <h3 className="font-semibold text-sm">Upcoming Meetings</h3>
                   <div className="text-xs bg-[#2a2a2a] p-1.5 rounded cursor-pointer"><Settings size={14}/></div>
               </div>
               
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#a0a0a0]">
                   <Calendar size={48} className="text-[#444] mb-4" strokeWidth={1}/>
                   <p className="text-sm">No upcoming meetings today</p>
               </div>
           </div>
        </div>
      </main>
    </div>
  )
}

export default Main;