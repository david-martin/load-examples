#!/bin/bash
docker rm -f $(docker ps -a -q  --filter name=redis3.0)