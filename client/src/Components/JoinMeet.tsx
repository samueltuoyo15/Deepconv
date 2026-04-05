import { useState, useEffect, useRef } from "react"
import { ArrowLeft, KeyRound, Video } from "lucide-react"
import { useNavigate } from "react-router-dom"

const JoinMeet = ({ toggle, setToggle }: { toggle: boolean, setToggle: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (toggle) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setInput("")
      setError(null)
    }
  }, [toggle])

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = input.trim().toLowerCase()
    if (!code) return setError("Please enter a strictly valid code")
    navigate(`/meet/room/${code}`)
  }

  return (
    <>
      <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-300 ${toggle ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setToggle(false)}
      />
      
      {toggle && (
        <section
          className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#121212] border-l border-[#333] shadow-[auto_0_80px_rgba(0,0,0,0.8)] transition-transform duration-400 ease-in-out flex flex-col ${
            toggle ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <header className="flex items-center px-8 pt-10 pb-6 border-b border-[#333]">
            <button className="bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#a0a0a0] hover:text-white p-2.5 rounded-xl transition-colors shrink-0 mr-4 border border-[#333]" onClick={() => setToggle(false)}>
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-2xl font-black text-white tracking-tight">Join Meeting</h2>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-8 py-10 overflow-y-auto">
            <div className="flex justify-center mb-10">
               <div className="w-20 h-20 bg-[#1c1c1c] border border-[#333] rounded-3xl flex items-center justify-center shadow-inner relative">
                  <Video size={32} className="text-[#0B5CFF] relative z-10" />
               </div>
            </div>

            <label htmlFor="input" className="text-[15px] block mb-4 font-semibold text-[#a0a0a0] text-center">
              Enter the meeting code or ID provided by the organizer to secure your connection.
            </label>

            <div className="relative group w-full mb-3">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a0a0a0] group-focus-within:text-[#0B5CFF] transition-colors">
                   <KeyRound size={20} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  id="input"
                  name="input"
                  placeholder="meet-aa0e3bd7..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setError(null)
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1c1c1c] border border-[#333] text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]/40 focus:border-[#0B5CFF] transition-all placeholder-[#a0a0a0]"
                />
            </div>

            {error && <div className="text-[#FF4D4D] font-medium text-sm bg-[#FF4D4D]/10 px-4 py-3 rounded-lg border border-[#FF4D4D]/20 animate-pulse">{error}</div>}

            <div className="flex-1" />

            <button
              type="submit"
              disabled={!input.trim() || !!error}
              className={`mt-8 w-full py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                !input.trim() || error 
                  ? "bg-[#1c1c1c] text-[#a0a0a0] cursor-not-allowed border border-[#333]" 
                  : "bg-[#0B5CFF] text-white hover:bg-[#1C68FF] shadow-[0_4px_20px_rgba(11,92,255,0.3)] hover:-translate-y-0.5"
              }`}
            >
              <span>Join Session</span>
              <ArrowLeft size={18} className="rotate-180" />
            </button>
          </form>
        </section>
      )}
    </>
  )
}

export default JoinMeet
