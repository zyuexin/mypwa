package main

import (
	"database/sql"
	"fmt"
	"log"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

const createTableSQL = `
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(30) PRIMARY KEY,
	sender VARCHAR(255) DEFAULT 'unknown',
	sender_type VARCHAR(255) DEFAULT 'browser',
	sender_detail VARCHAR(255) DEFAULT 'unknown',
	content_type VARCHAR(255) DEFAULT 'text',
	text LONGTEXT,
	file LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

func InitDB() {
	dsn := "root:root.123456@tcp(127.0.0.1:3306)/dta?parseTime=true&loc=Asia%2FShanghai"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}
	fmt.Println("Successfully connected!")
	DB = db
	if _, err := db.Exec(createTableSQL); err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}
	fmt.Println("Table created successfully!")
}

func GetHistory(msgId string) ([]Message, error) {
	var rows *sql.Rows
	var err error
	if msgId == "" {
		rows, err = DB.Query("SELECT * FROM ( SELECT * FROM messages ORDER BY created_at DESC LIMIT 15 ) AS subquery ORDER BY created_at ASC")
	} else {
		rows, err = DB.Query("SELECT * FROM (SELECT * FROM messages WHERE created_at < (SELECT created_at FROM messages WHERE id = ?) ORDER BY created_at DESC LIMIT 15 ) AS subquery ORDER BY created_at ASC;", msgId)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query messages: %v", err)
	}
	defer rows.Close()

	messages := make([]Message, 0)
	for rows.Next() {
		var message Message
		// 扫描所有数据库字段（需与表结构定义顺序一致）
		if err := rows.Scan(&message.ID, &message.Sender, &message.SenderType, &message.SenderDetail,
			&message.ContentType, &message.Text, &message.File, &message.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan message: %v", err)
		}
		messages = append(messages, message)
	}

	// 检查遍历过程中是否出现错误
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %v", err)
	}
	// reverse(messages)
	return messages, nil
}

func FindRowById(id string) (Message, error) {
	row := DB.QueryRow("SELECT * FROM messages WHERE id = ?", id)
	var msg Message
	if err := row.Scan(&msg.ID, &msg.Sender, &msg.SenderType,
		&msg.SenderDetail, &msg.ContentType,
		&msg.Text, &msg.File, &msg.CreatedAt); err != nil {
		return Message{}, fmt.Errorf("failed to query inserted message: %v", err)
	}
	return msg, nil
}

func InsertMessage(message Message) (Message, error) {
	_, err := DB.Exec("INSERT INTO messages (id, sender, sender_type, sender_detail, content_type, text, file) VALUES (?, ?, ?, ?, ?, ?, ?)", message.ID, message.Sender, message.SenderType, message.SenderDetail, message.ContentType, message.Text, message.File)
	if err != nil {
		return Message{}, err
	}
	return FindRowById(message.ID)
}

func FindLastedMessage() (Message, error) {
	var message Message
	row := DB.QueryRow("SELECT * FROM messages ORDER BY created_at DESC LIMIT 1")
	if err := row.Scan(&message.ID, &message.Sender, &message.SenderType,
		&message.ContentType, &message.Text, &message.File, &message.CreatedAt); err != nil {
		return message, fmt.Errorf("failed to scan message: %v", err)
	}
	return message, nil
}

func DeleteMessage(ids []string) error {
	query := "DELETE FROM messages WHERE id IN (?" + strings.Repeat(",?", len(ids)-1) + ")"
	// 执行SQL语句，?会被后面的参数替换
	result, err := DB.Exec(query, convertToInterface(ids)...)
	if err != nil {
		log.Fatal("DeleteMessage DB.Exec 方法执行报错：", err)
		return err
	}

	// 可选：检查受影响的行数
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Fatal("DeleteMessage DB.Exec 方法执行报错：", err)
		return err
	}
	if rowsAffected == 0 {
		log.Printf("DeleteMessage result.RowsAffected: 没有找到指定的记录： %v", ids)
		return nil
	}

	return nil
}

func convertToInterface(strs []string) []any {
	args := make([]any, len(strs))
	for i, s := range strs {
		args[i] = s
	}
	return args
}
