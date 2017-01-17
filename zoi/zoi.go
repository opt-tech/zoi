package zoi

import (
	"io"
	"strings"
	"net/url"
	"net/http"
)

type ImageType string
const (
	Png ImageType = "png"
	Svg ImageType = "svg"
)

type BadgeParam struct {
	Subject string `json:"subject"`
	Status string `json:"status"`
	Color string `json:"color"`
	ImageType ImageType `json:"imageType"`
}

func ContentType(imageType ImageType) (result string) {
	switch imageType {
	case Png: result = "image/png"
	case Svg: result = "image/svg+xml"
	}
	return
}

func DownloadBadge(param BadgeParam) (reader io.ReadCloser, err error) {
	apiRoot := "https://img.shields.io/badge/"
	subject := sanitize(param.Subject)
	status := sanitize(param.Status)

	name := subject + "-" + status + "-" + param.Color + "." + string(param.ImageType)
	badgeUrl := apiRoot + url.QueryEscape(name)

	var res *http.Response
	res, err = http.Get(badgeUrl)
	if err != nil { return }

	reader = res.Body
	return
}

func sanitize(str string) string {
	return strings.Replace(strings.Replace(str, "-", "--", -1), "_", "__", -1)
}
