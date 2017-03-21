#!/bin/bash
docker pull redis:3.0
docker rm -f $(docker ps -a -q  --filter name=redis3.0)
docker run -d -p 127.0.0.1:6379:6379 --name redis3.0 redis:3.0
