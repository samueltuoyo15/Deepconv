package hub

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID     string
	Name   string
	Conn   *websocket.Conn
	Rooms  map[string]bool
	Send   chan []byte
	Hub    *Hub
	Mu     sync.RWMutex
}

type Hub struct {
	Clients      map[string]*Client
	Rooms        map[string]map[string]*Client
	RoomMessages map[string][]ChatMessage
	Register     chan *Client
	Unregister   chan *Client
	Broadcast    chan *BroadcastMessage
	Mu           sync.RWMutex
}

type ChatMessage struct {
	From     string `json:"from"`
	Message  string `json:"message"`
	Type     string `json:"type"`
	FileName string `json:"fileName"`
	Time     int64  `json:"time"`
}

type BroadcastMessage struct {
	RoomID  string
	Message []byte
	Exclude string
}

func NewHub() *Hub {
	return &Hub{
		Clients:      make(map[string]*Client),
		Rooms:        make(map[string]map[string]*Client),
		RoomMessages: make(map[string][]ChatMessage),
		Register:     make(chan *Client),
		Unregister:   make(chan *Client),
		Broadcast:    make(chan *BroadcastMessage, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mu.Lock()
			h.Clients[client.ID] = client
			h.Mu.Unlock()

		case client := <-h.Unregister:
			h.Mu.Lock()
			if _, ok := h.Clients[client.ID]; ok {
				delete(h.Clients, client.ID)
				close(client.Send)
				
				for roomID := range client.Rooms {
					if room, exists := h.Rooms[roomID]; exists {
						delete(room, client.ID)
						if len(room) == 0 {
							delete(h.Rooms, roomID)
							delete(h.RoomMessages, roomID)
						}
					}
				}
			}
			h.Mu.Unlock()

		case message := <-h.Broadcast:
			h.Mu.RLock()
			if room, ok := h.Rooms[message.RoomID]; ok {
				for clientID, client := range room {
					if clientID != message.Exclude {
						select {
						case client.Send <- message.Message:
						default:
							close(client.Send)
							delete(h.Clients, client.ID)
							delete(room, client.ID)
						}
					}
				}
			}
			h.Mu.RUnlock()
		}
	}
}

func (h *Hub) JoinRoom(client *Client, roomID string) []*Client {
	h.Mu.Lock()
	defer h.Mu.Unlock()

	if h.Rooms[roomID] == nil {
		h.Rooms[roomID] = make(map[string]*Client)
	}

	existingClients := make([]*Client, 0)
	for _, c := range h.Rooms[roomID] {
		existingClients = append(existingClients, c)
	}

	h.Rooms[roomID][client.ID] = client
	client.Mu.Lock()
	client.Rooms[roomID] = true
	client.Mu.Unlock()

	return existingClients
}

func (h *Hub) GetClient(clientID string) (*Client, bool) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()
	client, ok := h.Clients[clientID]
	return client, ok
}

func (h *Hub) BroadcastToRoom(roomID string, message []byte, excludeID string) {
	h.Broadcast <- &BroadcastMessage{
		RoomID:  roomID,
		Message: message,
		Exclude: excludeID,
	}
}

func (h *Hub) SendToClient(clientID string, message []byte) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()
	
	if client, ok := h.Clients[clientID]; ok {
		select {
		case client.Send <- message:
		default:
		}
	}
}

func (h *Hub) GetRoomMessages(roomID string) []ChatMessage {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	if messages, ok := h.RoomMessages[roomID]; ok {
		return messages
	}
	return []ChatMessage{}
}

func (h *Hub) AddRoomMessage(roomID string, message ChatMessage) {
	h.Mu.Lock()
	defer h.Mu.Unlock()

	if h.RoomMessages[roomID] == nil {
		h.RoomMessages[roomID] = make([]ChatMessage, 0)
	}
	h.RoomMessages[roomID] = append(h.RoomMessages[roomID], message)
	
	if len(h.RoomMessages[roomID]) > 100 {
		h.RoomMessages[roomID] = h.RoomMessages[roomID][1:]
	}
}

func (h *Hub) GetRoomClients(roomID string) []string {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	clientIDs := make([]string, 0)
	if room, ok := h.Rooms[roomID]; ok {
		for id := range room {
			clientIDs = append(clientIDs, id)
		}
	}
	return clientIDs
}
