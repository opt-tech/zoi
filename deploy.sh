#!/bin/bash

mkdir -p dist
cd src/
npm install --production
zip -r ../dist/lambda.zip ./*
cd ..
aws lambda update-function-code --function-name zoi-badge-batch --zip-file fileb://dist/lambda.zip
