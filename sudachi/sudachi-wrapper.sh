#!/bin/sh
set -eu

cd "$(dirname "$0")" > /dev/null

exec ./sudachi -p resources -r resources/sudachi.json -l resources/system.dic "${@}"
