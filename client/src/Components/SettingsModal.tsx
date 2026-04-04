import { useState, useEffect } from 'react';
import { Settings, X, Video, Mic, Sparkles } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SettingsModal = ({ isOpen, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState('Audio');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState(localStorage.getItem('preferredMic') || '');
  const [selectedCam, setSelectedCam] = useState(localStorage.getItem('preferredCamera') || '');

  useEffect(() => {
    if (!isOpen) return;
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
        console.error('Device fetch error', err);
      }
    };
    getDevices();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center font-sans p-4" onClick={onClose}>
      <div
        className="bg-[#1c1c1c] w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#333]"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-[#212121] border-b md:border-b-0 md:border-r border-[#333] flex flex-col pt-4">
          <div className="px-4 mb-4">
            <input
              type="text"
              placeholder="Search settings..."
              className="w-full bg-[#121212] border border-[#444] rounded text-sm px-3 py-1.5 focus:outline-none focus:border-[#0B5CFF] text-white"
            />
          </div>
          <div className="flex-1 overflow-x-auto md:overflow-y-auto flex md:block whitespace-nowrap p-2 md:p-0">
            {(['General', 'Video', 'Audio'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-auto md:w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-3 rounded md:rounded-none transition-colors ${activeTab === tab ? 'bg-[#0B5CFF] text-white' : 'text-[#cccccc] hover:bg-[#333]'}`}
              >
                {tab === 'General' && <Settings size={18} />}
                {tab === 'Video' && <Video size={18} />}
                {tab === 'Audio' && <Mic size={18} />}
                {tab === 'General' ? 'General' : tab === 'Video' ? 'Video & effects' : 'Audio'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#121212] overflow-y-auto">
          <div className="sticky top-0 bg-[#121212] p-6 pb-4 border-b border-[#333] flex justify-between items-center z-10">
            <h2 className="text-xl font-bold text-white">{activeTab}</h2>
            <button
              onClick={onClose}
              className="text-[#a0a0a0] hover:text-white transition-colors p-1.5 bg-[#1c1c1c] hover:bg-[#333] rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 text-[#e0e0e0] space-y-8">

            {activeTab === 'Audio' && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-white">Microphone Input</h3>
                <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-5">
                  <p className="text-sm text-[#a0a0a0] mb-4">Select the microphone to use in meeting rooms.</p>
                  <select
                    value={selectedMic}
                    onChange={e => { setSelectedMic(e.target.value); localStorage.setItem('preferredMic', e.target.value); }}
                    className="w-full bg-[#2a2a2a] border border-[#444] rounded p-3 text-sm font-medium text-white focus:outline-none focus:border-[#0B5CFF] cursor-pointer mb-6 appearance-none"
                  >
                    {devices.filter(d => d.kind === 'audioinput').map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.substring(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium flex justify-between w-full">
                      <span>Input Volume</span>
                      <span className="text-[#0B5CFF]">Auto-adjusting</span>
                    </label>
                    <div className="w-full h-3 bg-[#444] rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-[#0B5CFF] rounded-full" />
                    </div>
                    <p className="text-xs text-[#a0a0a0] mt-1">Volume resets automatically to optimize output for remote listeners.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Video' && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-white">Camera & Visuals</h3>
                <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-5">
                  <p className="text-sm text-[#a0a0a0] mb-4">Select your preferred webcam for video streaming.</p>
                  <select
                    value={selectedCam}
                    onChange={e => { setSelectedCam(e.target.value); localStorage.setItem('preferredCamera', e.target.value); }}
                    className="w-full bg-[#2a2a2a] border border-[#444] rounded p-3 text-sm font-medium text-white focus:outline-none focus:border-[#0B5CFF] cursor-pointer mb-6 appearance-none"
                  >
                    {devices.filter(d => d.kind === 'videoinput').map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.substring(0, 5)}...`}
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
                <h3 className="text-lg font-bold mb-4 text-white">App Preferences</h3>
                <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Update app automatically</span>
                    <div className="w-10 h-5 bg-[#0B5CFF] rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="pl-6 space-y-2">
                    <label className="flex items-center gap-3 text-sm cursor-pointer opacity-80">
                      <div className="w-4 h-4 rounded-full border-4 border-[#0B5CFF] bg-white" />
                      <span>Stable (fewer updates, more stability)</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm cursor-pointer opacity-60">
                      <div className="w-4 h-4 rounded-full border border-[#888]" />
                      <span>Beta (more updates, earliest feature access)</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3 text-white">Recording</h3>
                  <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-5 space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-[#212121] rounded-lg border border-[#333]">
                      <Video size={24} className="text-[#0B5CFF] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Recording saves as <span className="text-[#0B5CFF]">.webm</span> (video)</p>
                        <p className="text-xs text-[#a0a0a0] mt-1">WebM is a high-quality open video format. It plays in Chrome, Firefox, and Edge. To convert to MP4, drag the file into <a href="https://cloudconvert.com" target="_blank" rel="noreferrer" className="text-[#0B5CFF] underline">cloudconvert.com</a>.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-[#212121] rounded-lg border border-[#333]">
                      <Settings size={24} className="text-[#0B5CFF] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">What gets recorded?</p>
                        <p className="text-xs text-[#a0a0a0] mt-1">All video tiles (your camera + all remote participants) are composited into a 1280x720 grid. Your microphone audio is included automatically - no screen sharing needed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
