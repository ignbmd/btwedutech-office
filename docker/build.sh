#!/bin/sh
VERSION=v0.4
docker build \
    -t registry.gitlab.com/btw-squad/btw-edutech-office:base-${VERSION} \
    -t registry.gitlab.com/btw-squad/btw-edutech-office:base \
    .

docker image push registry.gitlab.com/btw-squad/btw-edutech-office:base-${VERSION}
docker image push registry.gitlab.com/btw-squad/btw-edutech-office:base