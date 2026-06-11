package realtime

import (
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	pingPeriod = 50 * time.Second
	pongWait   = 60 * time.Second
	writeWait  = 10 * time.Second
)

type Client struct {
	Role   string
	Send   chan Event
	UserID string

	closeOnce sync.Once
	conn      *websocket.Conn
	hub       *Hub
}

type ClientIdentity struct {
	Role   string
	UserID string
}

func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request, identity ClientIdentity, origin string) error {
	upgrader := websocket.Upgrader{CheckOrigin: checkOrigin(origin)}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return err
	}

	client := &Client{
		Role:   identity.Role,
		Send:   make(chan Event, 16),
		UserID: identity.UserID,
		conn:   conn,
		hub:    h,
	}
	h.register <- client

	go client.writePump()
	go client.readPump()
	return nil
}

func (c *Client) Close() {
	c.closeOnce.Do(func() {
		close(c.Send)
		_ = c.conn.Close()
	})
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
	}()
	c.conn.SetReadLimit(512)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	for {
		if _, _, err := c.conn.ReadMessage(); err != nil {
			return
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.hub.unregister <- c
	}()

	for {
		select {
		case event, ok := <-c.Send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteJSON(event); err != nil {
				return
			}
		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func checkOrigin(allowed string) func(*http.Request) bool {
	return func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "" || allowed == "*" || origin == allowed
	}
}
