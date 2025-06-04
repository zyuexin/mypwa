package main

import (
	"strconv"
	"time"
)

type UnixTime time.Time

func (t UnixTime) MarshalJSON() ([]byte, error) {
	return []byte(strconv.FormatInt(time.Time(t).Unix(), 10)), nil
}

func (t *UnixTime) UnmarshalJSON(data []byte) error {
	sec, err := strconv.ParseInt(string(data), 10, 64)
	if err != nil {
		return err
	}
	*t = UnixTime(time.Unix(sec, 0))
	return nil
}

type Message struct {
	ID           string   `json:"id" db:"id"`
	Sender       string   `json:"sender" db:"sender"`
	SenderType   string   `json:"senderType" db:"sender_type"`
	SenderDetail string   `json:"senderDetail" db:"sender_detail"`
	ContentType  string   `json:"contentType" db:"content_type"`
	Text         string   `json:"text" db:"text"`
	File         string   `json:"file" db:"file"`
	CreatedAt    UnixTime `json:"createAt" db:"created_at"`
}

type Request struct {
	Action string `json:"action"`
	// 新消息
	Message Message `json:"message"`
	// 要删除的id列表
	DeleteIds []string `json:"deleteIds"`
}

type Response struct {
	Code uint8     `json:"code"`
	Data []Message `json:"data"`
	Msg  string    `json:"msg"`
}
