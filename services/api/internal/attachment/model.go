package attachment

import (
	"io"
	"time"
)

const MaxFileSizeBytes int64 = 10 * 1024 * 1024

type Attachment struct {
	ID            string    `json:"id"`
	TaskID        string    `json:"taskId"`
	UploadedBy    string    `json:"uploadedBy"`
	UploaderEmail string    `json:"uploaderEmail"`
	FileName      string    `json:"fileName"`
	ContentType   string    `json:"contentType"`
	SizeBytes     int64     `json:"sizeBytes"`
	StorageKey    string    `json:"-"`
	CreatedAt     time.Time `json:"createdAt"`
}

type UploadInput struct {
	TaskID      string
	UploaderID  string
	FileName    string
	ContentType string
	SizeBytes   int64
	Body        io.Reader
}

type CreateInput struct {
	TaskID      string
	UploaderID  string
	FileName    string
	ContentType string
	SizeBytes   int64
	StorageKey  string
}
