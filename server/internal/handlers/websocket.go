package handlers

import (
	"deep-conv-server/internal/hub"
	"deep-conv-server/internal/models"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WebSocketHandler struct {
	hub *hub.Hub
}

func NewWebSocketHandler(h *hub.Hub) *WebSocketHandler {
	return &WebSocketHandler{hub: h}
}

func (wsh *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	clientID := generateID()
	client := &hub.Client{
		ID:    clientID,
		Name:  fmt.Sprintf("Guest-%d", rand.Intn(1000)),
		Conn:  conn,
		Rooms: make(map[string]bool),
		Send:  make(chan []byte, 256),
		Hub:   wsh.hub,
	}

	wsh.hub.Register <- client

	var wg sync.WaitGroup
	wg.Add(2)

	go wsh.writePump(client, &wg)
	go wsh.readPump(client, &wg)

	wg.Wait()
}

func (wsh *WebSocketHandler) readPump(client *hub.Client, wg *sync.WaitGroup) {
	defer func() {
		wsh.hub.Unregister <- client
		client.Conn.Close()
		wg.Done()
	}()

	client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	client.Conn.SetPongHandler(func(string) error {
		client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		var socketMsg models.SocketMessage
		if err := json.Unmarshal(message, &socketMsg); err != nil {
			log.Printf("Failed to unmarshal message: %v", err)
			continue
		}

		wsh.handleEvent(client, socketMsg.Event, socketMsg.Data)
	}
}

func (wsh *WebSocketHandler) writePump(client *hub.Client, wg *sync.WaitGroup) {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		client.Conn.Close()
		wg.Done()
	}()

	for {
		select {
		case message, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (wsh *WebSocketHandler) handleEvent(client *hub.Client, event string, data interface{}) {
	switch event {
	case "join":
		wsh.handleJoin(client, data)
	case "offer":
		wsh.handleOffer(client, data)
	case "answer":
		wsh.handleAnswer(client, data)
	case "candidate":
		wsh.handleCandidate(client, data)
	case "hand-raise":
		wsh.handleHandRaise(client, data)
	case "chat-message":
		wsh.handleChatMessage(client, data)
	}
}

func (wsh *WebSocketHandler) handleJoin(client *hub.Client, data interface{}) {
	dataBytes, _ := json.Marshal(data)
	var payload models.JoinPayload
	if err := json.Unmarshal(dataBytes, &payload); err != nil {
		log.Printf("Failed to unmarshal join payload: %v", err)
		return
	}

	if payload.Name != "" {
		client.Mu.Lock()
		client.Name = payload.Name
		client.Mu.Unlock()
	}

	existingClients := wsh.hub.JoinRoom(client, payload.RoomID)

	existingUsers := make([]models.User, 0)
	for _, c := range existingClients {
		c.Mu.RLock()
		existingUsers = append(existingUsers, models.User{
			ID:   c.ID,
			Name: c.Name,
		})
		c.Mu.RUnlock()
	}

	response := models.SocketMessage{
		Event: "existing-users",
		Data:  existingUsers,
	}
	responseBytes, _ := json.Marshal(response)
	client.Send <- responseBytes

	roomMessages := wsh.hub.GetRoomMessages(payload.RoomID)
	if len(roomMessages) > 0 {
		historyResponse := models.SocketMessage{
			Event: "chat-history",
			Data:  roomMessages,
		}
		historyBytes, _ := json.Marshal(historyResponse)
		client.Send <- historyBytes
	}

	client.Mu.RLock()
	userConnected := models.SocketMessage{
		Event: "user-connected",
		Data: models.User{
			ID:   client.ID,
			Name: client.Name,
		},
	}
	client.Mu.RUnlock()
	
	userConnectedBytes, _ := json.Marshal(userConnected)
	wsh.hub.BroadcastToRoom(payload.RoomID, userConnectedBytes, client.ID)
}

func (wsh *WebSocketHandler) handleOffer(client *hub.Client, data interface{}) {
	dataBytes, _ := json.Marshal(data)
	var payload models.OfferPayload
	if err := json.Unmarshal(dataBytes, &payload); err != nil {
		return
	}

	response := models.SocketMessage{
		Event: "offer",
		Data: map[string]interface{}{
			"from":  client.ID,
			"offer": payload.Offer,
		},
	}
	responseBytes, _ := json.Marshal(response)
	wsh.hub.SendToClient(payload.To, responseBytes)
}

func (wsh *WebSocketHandler) handleAnswer(client *hub.Client, data interface{}) {
	dataBytes, _ := json.Marshal(data)
	var payload models.AnswerPayload
	if err := json.Unmarshal(dataBytes, &payload); err != nil {
		return
	}

	response := models.SocketMessage{
		Event: "answer",
		Data: map[string]interface{}{
			"from":   client.ID,
			"answer": payload.Answer,
		},
	}
	responseBytes, _ := json.Marshal(response)
	wsh.hub.SendToClient(payload.To, responseBytes)
}

func (wsh *WebSocketHandler) handleCandidate(client *hub.Client, data interface{}) {
	dataBytes, _ := json.Marshal(data)
	var payload models.CandidatePayload
	if err := json.Unmarshal(dataBytes, &payload); err != nil {
		return
	}

	response := models.SocketMessage{
		Event: "candidate",
		Data: map[string]interface{}{
			"from":      client.ID,
			"candidate": payload.Candidate,
		},
	}
	responseBytes, _ := json.Marshal(response)
	wsh.hub.SendToClient(payload.To, responseBytes)
}

func (wsh *WebSocketHandler) handleHandRaise(client *hub.Client, data interface{}) {
	dataBytes, _ := json.Marshal(data)
	var payload models.HandRaisePayload
	if err := json.Unmarshal(dataBytes, &payload); err != nil {
		return
	}

	response := models.SocketMessage{
		Event: "hand-raise",
		Data: map[string]interface{}{
			"from":     client.ID,
			"isRaised": payload.IsRaised,
		},
	}
	responseBytes, _ := json.Marshal(response)
	wsh.hub.BroadcastToRoom(payload.RoomID, responseBytes, client.ID)
}

func (wsh *WebSocketHandler) handleChatMessage(client *hub.Client, data interface{}) {
	dataBytes, _ := json.Marshal(data)
	var payload models.ChatMessagePayload
	if err := json.Unmarshal(dataBytes, &payload); err != nil {
		return
	}

	chatMsg := hub.ChatMessage{
		From:     client.ID,
		Message:  payload.Message,
		Type:     payload.Type,
		FileName: payload.FileName,
		Time:     time.Now().UnixMilli(),
	}
	wsh.hub.AddRoomMessage(payload.RoomID, chatMsg)

	response := models.SocketMessage{
		Event: "chat-message",
		Data: map[string]interface{}{
			"from":     client.ID,
			"message":  payload.Message,
			"type":     payload.Type,
			"fileName": payload.FileName,
		},
	}
	responseBytes, _ := json.Marshal(response)
	wsh.hub.BroadcastToRoom(payload.RoomID, responseBytes, client.ID)
}

func generateID() string {
	return fmt.Sprintf("%d-%d", time.Now().UnixNano(), rand.Intn(10000))
}
