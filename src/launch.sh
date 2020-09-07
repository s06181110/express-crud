#!/usr/bin/env bash

cd /src

echo 'install dependencies...'

npm install --no-save

echo 'launching...'

cd `dirname $0`

npm run start