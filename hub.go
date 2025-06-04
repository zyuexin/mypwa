package main

import (
	"encoding/json"
	"log"
)

type Hub struct {
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	boardcast  chan []byte
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		boardcast:  make(chan []byte),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if ok := h.clients[client]; ok {
				client.conn.Close()
				delete(h.clients, client)
			}
		// h.boardcast是client.readPump在写入
		case message := <-h.boardcast:
			var wsReq Request
			err := json.Unmarshal([]byte(message), &wsReq)
			if err != nil {
				continue
			}
			if wsReq.Action == "sendNewMsg" {
				// 向数据库插入消息并查一次库将新消息返回
				newRow, err := InsertMessage(wsReq.Message)
				if err == nil {
					wsReq.Message = newRow
					message, _ = json.Marshal(wsReq)
				}
			} else if wsReq.Action == "deleteMsg" {
				// 从数据库删除指定消息
				err := DeleteMessage(wsReq.DeleteIds)
				if err != nil {
					log.Fatalln("删除消息失败: (hub.run message := <-h.boardcast)", err)
					continue
				}
			}
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}
