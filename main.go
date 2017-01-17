package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/jessevdk/go-flags"
	"github.com/ocadaruma/zoi/storage"
	"github.com/ocadaruma/zoi/zoi"
)

var AppVersion string
const (
	usage = "-c <config_path> -j <coverage_json_path>"
)

func main() {
	var err error

	var o *opts
	o, err = parseArgs()
	validateError(err)

	var data []byte
	var file string
	file ,err = filepath.Abs(o.Config)
	validateError(err)
	data, err = ioutil.ReadFile(file)
	validateError(err)

	cfg := config{}
	err = json.Unmarshal(data, &cfg)
	validateError(err)

	file ,err = filepath.Abs(o.JsonFile)
	validateError(err)
	data, err = ioutil.ReadFile(file)
	validateError(err)

	param := zoi.BadgeParam{}
	err = json.Unmarshal(data, &param)
	validateError(err)

	reader, err := zoi.DownloadBadge(param)
	validateError(err)

	storage := storage.S3Storage{
		Bucket: cfg.Bucket,
		PathPrefix: cfg.PathPrefix,
	}

	defer reader.Close()
	err = storage.UploadBadge(param, reader)
	validateError(err)
}

type opts struct {
	JsonFile string `short:"j" long:"jsonFile" description:"specify coverage json path" required:"true"`
	Config string `short:"c" long:"config" description:"specify config path" required:"true"`
	Version func() `short:"v" long:"version" description:"show program's version number and exit"`
}

type config struct {
	Bucket string `json:"bucket"`
	PathPrefix string `json:"path"`
}

func parseArgs() (result *opts, err error) {
	o := opts{}
	o.Version = func() {
		fmt.Printf("zoi %s\n", AppVersion)
		os.Exit(0)
	}

	result = &o
	parser := flags.NewParser(result, flags.Default)
	parser.Usage = usage

	_, err = parser.Parse()
	if err != nil { os.Exit(1) }

	return
}

func validateError(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
