import { useState, useEffect } from 'react';
import { Home, MessageSquare, Monitor, Settings, X, Video, Menu, Sparkles, Mic } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Audio');
  
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState(localStorage.getItem('preferredMic') || '');
  const [selectedCam, setSelectedCam] = useState(localStorage.getItem('preferredCamera') || '');
  
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    if (isSettingsOpen) {
      const getDevices = async () => {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          setDevices(allDevices);
          if (!selectedMic) {
            const defaultMic = allDevices.find(d => d.kind === 'audioinput')?.deviceId || '';
            setSelectedMic(defaultMic);
            localStorage.setItem('preferredMic', defaultMic);
          }
          if (!selectedCam) {
            const defaultCam = allDevices.find(d => d.kind === 'videoinput')?.deviceId || '';
            setSelectedCam(defaultCam);
            localStorage.setItem('preferredCamera', defaultCam);
          }
        } catch (err) {
          console.error("Device fetch error", err);
        }
      };
      getDevices();
    }
  }, [isSettingsOpen, selectedMic, selectedCam]);

  const handleMicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMic(e.target.value);
    localStorage.setItem('preferredMic', e.target.value);
  };

  const handleCamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCam(e.target.value);
    localStorage.setItem('preferredCamera', e.target.value);
  };

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

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center font-sans p-4">
          <div className="bg-[#1c1c1c] w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#333]">
            
            <div className="w-full md:w-64 bg-[#212121] border-b md:border-b-0 md:border-r border-[#333] flex flex-col pt-4">
              <div className="px-4 mb-4">
                <div className="relative">
                  <input type="text" placeholder="Search" className="w-full bg-[#121212] border border-[#444] rounded text-sm px-3 py-1.5 focus:outline-none focus:border-[#0B5CFF] text-white" />
                </div>
              </div>
              
              <div className="flex-1 overflow-x-auto md:overflow-y-auto flex md:block whitespace-nowrap hide-scrollbar p-2 md:p-0">
                <button onClick={() => setActiveTab('General')} className={`w-auto md:w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-3 rounded md:rounded-none transition-colors ${activeTab === 'General' ? 'bg-[#0B5CFF] text-white' : 'text-[#cccccc] hover:bg-[#333]'}`}>
                  <Settings size={18} /> General
                </button>
                <button onClick={() => setActiveTab('Video')} className={`w-auto md:w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-3 rounded md:rounded-none transition-colors ${activeTab === 'Video' ? 'bg-[#0B5CFF] text-white' : 'text-[#cccccc] hover:bg-[#333]'}`}>
                  <Video size={18} /> Video & effects
                </button>
                <button onClick={() => setActiveTab('Audio')} className={`w-auto md:w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-3 rounded md:rounded-none transition-colors ${activeTab === 'Audio' ? 'bg-[#0B5CFF] text-white' : 'text-[#cccccc] hover:bg-[#333]'}`}>
                  <Mic size={18} /> Audio
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#121212] overflow-y-auto relative no-scrollbar">
              <div className="sticky top-0 bg-[#121212] p-6 pb-4 border-b border-[#333] flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-white">{activeTab}</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-[#a0a0a0] hover:text-white transition-colors p-1 bg-[#1c1c1c] rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 text-[#e0e0e0] space-y-8">
                
                {activeTab === 'Audio' && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
                       Microphone Input Configuration
                    </h3>
                    <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-5">
                       <p className="text-sm text-[#a0a0a0] mb-4">Select the hardware microphone you wish to record with in the meeting room.</p>
                       
                       <select value={selectedMic} onChange={handleMicChange} className="w-full bg-[#2a2a2a] border border-[#444] rounded p-3 text-sm font-medium text-white focus:outline-none focus:border-[#0B5CFF] cursor-pointer mb-6 appearance-none">
                          {devices.filter(d => d.kind === 'audioinput').map(device => (
                             <option key={device.deviceId} value={device.deviceId}>
                               {device.label || `Microphone ${device.deviceId.substring(0,5)}...`}
                             </option>
                          ))}
                       </select>
                       
                       <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium flex justify-between w-full"><span>Input Volume</span> <span className="text-[#0B5CFF]">Auto-adjusting</span></label>
                          <div className="w-full h-3 bg-[#444] rounded-full overflow-hidden">
                             <div className="w-2/3 h-full bg-[#0B5CFF] rounded-full"></div>
                          </div>
                          <p className="text-xs text-[#a0a0a0] mt-1">Volume resets automatically to optimize output for remote listeners.</p>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Video' && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
                       Camera & Visuals
                    </h3>
                    <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-5">
                       <p className="text-sm text-[#a0a0a0] mb-4">Select your preferred webcam for video streaming.</p>
                       
                       <select value={selectedCam} onChange={handleCamChange} className="w-full bg-[#2a2a2a] border border-[#444] rounded p-3 text-sm font-medium text-white focus:outline-none focus:border-[#0B5CFF] cursor-pointer mb-6 appearance-none">
                          {devices.filter(d => d.kind === 'videoinput').map(device => (
                             <option key={device.deviceId} value={device.deviceId}>
                               {device.label || `Camera ${device.deviceId.substring(0,5)}...`}
                             </option>
                          ))}
                       </select>
                       
                       <div className="p-4 border border-[#444] border-dashed rounded bg-[#212121] text-center">
                          <Sparkles size={24} className="mx-auto text-[#0B5CFF] mb-2" />
                          <p className="text-sm font-semibold">AI Virtual Backgrounds</p>
                          <p className="text-xs text-[#a0a0a0] mt-1">Server-side visual blur processing coming soon in v2.0!</p>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'General' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-white">DeepConv App Features</h3>
                    <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-5 space-y-4">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Update app automatically</span>
                        <div className="w-10 h-5 bg-[#0B5CFF] rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>

                      <div className="pl-6 space-y-2">
                        <label className="flex items-center gap-3 text-sm cursor-pointer opacity-80">
                          <div className="w-4 h-4 rounded-full border-4 border-[#0B5CFF] bg-white"></div>
                          <span>Slow (fewer updates, more stability)</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm cursor-pointer opacity-60">
                          <div className="w-4 h-4 rounded-full border border-[#888]"></div>
                          <span>Fast (more updates, earliest feature access)</span>
                        </label>
                      </div>

                      <hr className="border-[#333]" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Auto-start DeepConv on Web Login</span>
                        <div className="w-10 h-5 bg-[#444] rounded-full relative cursor-pointer">
                          <div className="absolute left-1 top-0.5 w-4 h-4 bg-[#a0a0a0] rounded-full"></div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;