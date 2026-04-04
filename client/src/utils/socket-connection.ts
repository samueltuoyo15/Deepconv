import { io, Socket } from "socket.io-client"

const getSocket = (roomId: string): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin || "http://localhost:10000"
    const socket = io(baseUrl, {
      query: { roomId },
      transports: ["websocket"]
    })

    socket.on("connect", () => {
      console.log(`Connected to room: ${roomId}`)
      resolve(socket)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      reject(error)
    })
  })
}

export default getSocket
