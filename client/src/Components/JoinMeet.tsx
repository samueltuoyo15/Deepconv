import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const JoinMeet = ({ toggle, setToggle, }: {  toggle: boolean 
  setToggle: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = () => {
    if (!input.trim()) return setError("Please enter a valid code")
    if (!input.startsWith("meet-"))
      return setError("Meeting does not exist, please check and try again")
    navigate(`/meet/room/${input}`)
  }

  return (
    <>
      <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity ${toggle ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setToggle(false)}
      />
      
      {toggle && (
        <section
          className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 p-8 ${
            toggle ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <header className="flex justify-between items-center mb-12">
            <div className="flex items-center text-2xl font-extrabold text-gray-900 tracking-tight">
              <div className="bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200 transition mr-4" onClick={() => setToggle((prev) => !prev)}>
                <ArrowLeft size={24} />
              </div>
              <span>Join with code</span>
            </div>
          </header>

          <div className="text-gray-900 font-sans">
            <label htmlFor="input" className="text-lg block mb-6 font-medium text-gray-500">
              Enter the meeting code or ID provided by the organizer to jump right in.
            </label>
            <input
              type="text"
              id="input"
              name="input"
              placeholder="e.g. meet-aa0e3bd7-..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError(null)
              }}
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all shadow-inner"
            />
            {error && <p className="text-red-500 mt-3 font-semibold text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

            <button
              className={`mt-8 w-full py-4 px-6 rounded-full font-bold text-lg transition-all ${
                !input || error 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-green-500 text-white hover:bg-green-600 shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:scale-105"
              }`}
              onClick={input && !error ? handleSubmit : undefined}
            >
              Join Meeting
            </button>
          </div>
        </section>
      )}
    </>
  )
}

export default JoinMeet
