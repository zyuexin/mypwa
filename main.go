package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

func init() {
	// 设置全局时区为 Asia/Shanghai
	location, err := time.LoadLocation("Asia/Shanghai")
	if err != nil {
		fmt.Println("Error loading location:", err)
		return
	}
	time.Local = location
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 设置允许所有来源访问，实际应用中应该只允许特定的域名
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// 设置允许的HTTP方法
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// 设置允许的HTTP请求头
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			// 对于预检请求(preflight request)，直接返回200状态码
			w.WriteHeader(http.StatusOK)
			return
		}

		// 调用下一个处理器
		next.ServeHTTP(w, r)
	})
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	rows, err := GetHistory("")
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		return
	}
	res := Response{Code: 1, Data: rows, Msg: "查询历史消息成功"}
	json.NewEncoder(w).Encode(res)
}

func queryEarlierMsgs(w http.ResponseWriter, r *http.Request) {
	msgId := r.URL.Query().Get("msgId")
	log.Println("queryEarlierMsgs msgId:", msgId)
	rows, _ := GetHistory(msgId)
	res := Response{Code: 1, Data: rows, Msg: "查询更多历史消息成功"}
	json.NewEncoder(w).Encode(res)
}

func main() {
	InitDB()
	hub := newHub()
	go hub.run()
	mux := http.NewServeMux()
	handler := corsMiddleware(mux)
	mux.HandleFunc("/init", serveHome)
	mux.HandleFunc("/earlierMsgs", queryEarlierMsgs)
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) { serveWS(w, r, hub) })

	if err := http.ListenAndServe(":8181", handler); err != nil {
		log.Fatal("8181启动失败", err)
	}
}
