package models

type JoinPayload struct {
	RoomID string `json:"roomId"`
	Name   string `json:"name"`
}

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type OfferPayload struct {
	To    string      `json:"to"`
	Offer interface{} `json:"offer"`
}

type AnswerPayload struct {
	To     string      `json:"to"`
	Answer interface{} `json:"answer"`
}

type CandidatePayload struct {
	To        string      `json:"to"`
	Candidate interface{} `json:"candidate"`
}

type HandRaisePayload struct {
	RoomID   string `json:"roomId"`
	IsRaised bool   `json:"isRaised"`
}

type ChatMessagePayload struct {
	RoomID   string `json:"roomId"`
	Message  string `json:"message"`
	Type     string `json:"type"`
	FileName string `json:"fileName"`
}

type SocketMessage struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}
