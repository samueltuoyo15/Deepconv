import express from "express"
import { Server } from "socket.io"
import { createServer } from "http"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL! }))
app.use(helmet())
app.use(express.json())

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*"
  }
})

const userNames = new Map<string, string>();

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`)

  socket.on("join", (payload: any) => {
    // Handle both old and new payload formats gracefully
    const roomId = typeof payload === "string" ? payload : payload.roomId;
    const name = payload.name || `Guest-${Math.floor(Math.random() * 1000)}`;
    
    userNames.set(socket.id, name);
    socket.join(roomId)
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
    const others = clients.filter(id => id !== socket.id)
    
    const existingUsers = others.map(id => ({ id, name: userNames.get(id) || "Guest" }));
    
    socket.emit("existing-users", existingUsers)
    socket.to(roomId).emit("user-connected", { id: socket.id, name })
  })

  socket.on("offer", ({ to, offer }) => {
    socket.to(to).emit("offer", { from: socket.id, offer })
  })

  socket.on("answer", ({ to, answer }) => {
    socket.to(to).emit("answer", { from: socket.id, answer })
  })

  socket.on("candidate", ({ to, candidate }) => {
    socket.to(to).emit("candidate", { from: socket.id, candidate })
  })

  socket.on("hand-raise", ({ roomId, isRaised }) => {
    socket.to(roomId).emit("hand-raise", { from: socket.id, isRaised })
  })

  socket.on("chat-message", ({ roomId, message }) => {
    socket.to(roomId).emit("chat-message", { from: socket.id, message })
  })

  socket.on("disconnect", () => {
    userNames.delete(socket.id);
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.to(room).emit("user-disconnected", socket.id)
      }
    })
  })

})

app.get("/", (req, res) => {
  res.send("Server is running.")
})

const PORT = process.env.PORT || "10000"
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
