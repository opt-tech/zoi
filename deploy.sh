#!/bin/bash

cd src/
zip -r ../dist/lambda.zip ./*
cd ..
aws lambda update-function-code --function-name zoi-badge-batch --zip-file fileb://dist/lambda.zip
