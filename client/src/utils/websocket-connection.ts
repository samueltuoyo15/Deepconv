type EventCallback = (data: any) => void

class WebSocketConnection {
  private ws: WebSocket | null = null
  private url: string
  private listeners: Map<string, EventCallback[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(url: string) {
    this.url = url
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            const { event: eventName, data } = message
            
            if (this.listeners.has(eventName)) {
              this.listeners.get(eventName)?.forEach(callback => callback(data))
            }
          } catch (err) {
            console.error("Failed to parse message:", err)
          }
        }

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          reject(error)
        }

        this.ws.onclose = () => {
          this.handleReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        this.connect().catch(console.error)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  emit(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }))
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  off(event: string, callback?: EventCallback) {
    if (!callback) {
      this.listeners.delete(event)
    } else {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }
}

const getSocket = async (_roomId: string): Promise<WebSocketConnection> => {
  const base = import.meta.env.VITE_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:10000")
  const wsUrl = base.replace(/^http/, "ws")
  const socket = new WebSocketConnection(`${wsUrl}/ws`)
  await socket.connect()
  return socket
}

export default getSocket
