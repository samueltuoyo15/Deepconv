import { useRef, useState } from 'react'
import { Send, Paperclip, Minimize2, X } from 'lucide-react'
import { useRoomStore } from '../store/useRoomStore'

const RoomChat = ({ socketRef, roomId }: { socketRef: any, roomId: string }) => {
  const { messages, setMessages, isChatOpen, setIsChatOpen, isChatMinimized, setIsChatMinimized, participantNames, participantAvatars, avatar } = useRoomStore()
  const [currentMessage, setCurrentMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isChatOpen) return null

  const renderTextWithLinks = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.split(urlPattern).map((part, i) => {
      if (part.match(urlPattern)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#0B5CFF] font-bold hover:underline">{part}</a>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Str = event.target?.result as string
      const isImage = file.type.startsWith('image/')
      const type = isImage ? 'image' : 'file'
      socketRef.current?.emit("chat-message", {
        roomId,
        message: base64Str,
        type,
        fileName: file.name
      })
      setMessages(prev => [...prev, { sender: "You", text: base64Str, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), type, fileName: file.name }])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="fixed right-4 w-[calc(100vw-2rem)] sm:w-[22rem] md:w-80 lg:w-[21rem] bg-[#1c1c1c]/95 backdrop-blur-3xl rounded-xl p-4 md:p-5 flex flex-col border border-[#333] z-40 shadow-2xl animate-slide-up" style={{ top: '5.5rem', bottom: '9rem', maxHeight: 'calc(100vh - 14.5rem)', height: 'calc(100vh - 14.5rem)' }}>
        <div className="flex justify-between items-center mb-4 md:mb-6 pl-2 pr-1 shrink-0">
          <h3 className="font-extrabold text-lg md:text-xl tracking-tight text-white">Room Chat</h3>
          <button onClick={() => setIsChatOpen(false)} className="text-[#a0a0a0] hover:text-white bg-[#2a2a2a] p-2 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 scrollbar-hide pr-2 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#a0a0a0] text-sm font-medium">
            No messages yet. Send a message to start the chat!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`p-3.5 rounded-2xl max-w-[85%] shadow-md break-words ${
              msg.sender === "You" 
                ? "bg-[#0B5CFF] text-white self-end rounded-br-sm" 
                : "bg-[#2a2a2a] text-white self-start rounded-bl-sm border border-[#333]"
            }`}
          >
            <div className="flex justify-between items-end gap-3 mb-2">
              <div className="flex items-center gap-1.5">
                <img src={msg.sender === "You" ? avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=You&backgroundColor=0B5CFF` : (participantAvatars[msg.sender] || `https://api.dicebear.com/9.x/avataaars/svg?seed=${participantNames[msg.sender] || msg.sender}&backgroundColor=2a2a2a`)} alt="avatar" className="w-5 h-5 rounded-full" />
                <span className={`text-xs block font-bold truncate ${msg.sender === "You" ? "opacity-90 text-white" : "text-[#a0a0a0]"}`}>
                  {msg.sender === "You" ? "You" : (participantNames[msg.sender] || "Participant")}
                </span>
              </div>
              <span className={`text-[10px] whitespace-nowrap opacity-60`}>
                {msg.time}
              </span>
            </div>
            {msg.type === 'image' ? (
              <img src={msg.text} alt="Shared" className="rounded-lg mt-1 max-w-full shadow-sm" />
            ) : msg.type === 'file' ? (
              <a href={msg.text} download={msg.fileName} className="flex items-center gap-2 p-3 bg-[#444] rounded-lg hover:bg-[#555] transition-colors mt-2">
                <Paperclip size={18} /> <span className="text-sm font-semibold underline truncate max-w-[150px]">{msg.fileName || "Download"}</span>
              </a>
            ) : (
              <span className="font-semibold text-[14px] leading-snug whitespace-pre-wrap">{renderTextWithLinks(msg.text)}</span>
            )}
          </div>
        ))}
      </div>

      <form 
        className="flex gap-2 shrink-0 mt-auto" 
        onSubmit={(e) => {
          e.preventDefault();
          if (!currentMessage.trim()) return;
          
          socketRef.current?.emit("chat-message", { 
              roomId, 
              message: currentMessage,
              type: 'text'
          })
          
          setMessages(prev => [...prev, { sender: "You", text: currentMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), type: 'text' }])
          setCurrentMessage("")
        }}
      >
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#2a2a2a] text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-[#333] transition-colors border border-[#333] shrink-0">
          <Paperclip size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
        <input 
          type="text" 
          value={currentMessage}
          onChange={e => setCurrentMessage(e.target.value)}
          placeholder="Type..." 
          className="flex-1 min-w-0 bg-[#2a2a2a] rounded-full px-3 md:px-5 py-2.5 md:py-3.5 text-xs md:text-sm font-medium focus:outline-none focus:border-[#0B5CFF] border border-[#333] shadow-inner text-white placeholder-[#a0a0a0]"
        />
        <button type="submit" className="bg-[#0B5CFF] text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-[#1C68FF] transition-colors shadow-lg shrink-0">
          <Send size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
      </form>
    </div>
  )
}

export default RoomChat
