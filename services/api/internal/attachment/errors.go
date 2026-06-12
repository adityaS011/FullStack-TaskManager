package attachment

import "errors"

var (
	ErrAttachmentNotFound     = errors.New("attachment not found")
	ErrFileRequired           = errors.New("file is required")
	ErrFileTooLarge           = errors.New("file is too large")
	ErrInvalidStorageKey      = errors.New("invalid storage key")
	ErrUnsupportedContentType = errors.New("unsupported content type")
)
