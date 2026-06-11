package realtime

import "context"

type Hub struct {
	broadcast  chan Event
	clients    map[*Client]struct{}
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan Event, 32),
		clients:    map[*Client]struct{}{},
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			for client := range h.clients {
				client.Close()
				delete(h.clients, client)
			}
			return
		case client := <-h.register:
			h.clients[client] = struct{}{}
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				client.Close()
				delete(h.clients, client)
			}
		case event := <-h.broadcast:
			h.deliver(event)
		}
	}
}

func (h *Hub) Publish(event Event) {
	select {
	case h.broadcast <- event:
	default:
	}
}

func (h *Hub) deliver(event Event) {
	for client := range h.clients {
		if !event.VisibleTo(client.UserID, client.Role) {
			continue
		}

		select {
		case client.Send <- event:
		default:
			client.Close()
			delete(h.clients, client)
		}
	}
}
