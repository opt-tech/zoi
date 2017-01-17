#!/bin/bash

RELEASE_VERSION="0.0.1"

function build {
    osname=$1
    GOOS=$2
    GOARCH=$3

    echo "Building ${osname} binary"
    export GOOS
    export GOARCH
    go build -ldflags "${ldflags}" -o ${workingdir}/${target}

    if [ $? -ne 0 ]; then
        echo "Build failed for ${osname}"
        exit 1
    fi

    (cd ${workingdir} && tar cfz ./zoi-bin-${osname}-${timestamp}.tar.gz ${target})
}

workingdir="${TMPDIR}/zoi"
target=zoi
timestamp=$(date "+%Y%m%d%H%M%S")
ldflags="-X main.AppVersion=${RELEASE_VERSION}"

mkdir -p ${workingdir}
build osx darwin amd64
build linux linux amd64

echo "Binaries found in:"
ls -1 ${workingdir}/zoi-bin*${timestamp}.tar.gz
