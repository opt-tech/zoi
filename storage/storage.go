package storage

import (
	"io"

	"github.com/ocadaruma/zoi/zoi"
)

type Storage interface {
	UploadBadge(param zoi.BadgeParam, badgeData io.Reader) error
}
