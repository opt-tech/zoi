package storage

import (
	"io"
	"path"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/ocadaruma/zoi/zoi"
)

type S3Storage struct {
	Bucket string
	PathPrefix string
	AccessKeyId string
	SecretAccessKey string
	SessionToken 	string
	Region string
}

func (storage *S3Storage) UploadBadge(param zoi.BadgeParam, badgeData io.Reader) (err error) {

	cfg := aws.Config{}
	if storage.Region != "" {
		cfg.Region = aws.String(storage.Region)
	}
	if storage.AccessKeyId != "" && storage.SecretAccessKey != "" {
		cfg.Credentials = credentials.NewStaticCredentials(storage.AccessKeyId, storage.SecretAccessKey, storage.SessionToken)
	}

	uploader := s3manager.NewUploader(session.New(&cfg))

	_, err = uploader.Upload(&s3manager.UploadInput{
		Key: aws.String(path.Join(storage.PathPrefix, param.Subject + "." + string(param.ImageType))),
		ContentType: aws.String(zoi.ContentType(param.ImageType)),
		CacheControl: aws.String("no-cache"),
		Body: badgeData,
		Bucket: aws.String(storage.Bucket),
	})

	return
}
