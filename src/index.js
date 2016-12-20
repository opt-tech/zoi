'use strict'

console.log("Ganbaru zoi")
const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const http = require('https');
const fs = require('fs');
const put = require('./get-svg');

// s3://zoi-coverage/
//    -- report/master.json
// s3://zoi-public/
//    -- branch/master.png
//    -- images/*.png

exports.handler = (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const getObject = (err, data) => {
    if (err) context.done('error', `error getting file${err}`);
    console.log(`data:${JSON.stringify(data, null, ' ')}`);
    try {
      // Coverage Report Object
      const cro = JSON.parse(data.Body);
      if (!cro.coverage) context.done('error', `property 'coverage' not found`);
      const coverage = Number(cro.coverage);
      if (isNaN(coverage)) {
        throw `property 'coverage' is not a number`;
      }
      const rounded = Math.round(coverage);
      if (rounded < 0 || 100 < rounded) {
        throw `property 'coverage' out of range:${rounded}`;
      }
      console.log(`coverage:${rounded}!!`); //FIXME

      const bucket = 'zoi-public';

      // generate badge
      // const convert4shieldsIo = str => str.replace(/-/g, '--').replace(/_/g, '__');
      // const subject = convert4shieldsIo(cro['subject']) || 'subject';
      const url = `https://img.shields.io/badge/front--coverage-${coverage}%25-green.svg`

      put(url);
    } catch (e) {
      context.done('error', `${e}`);
    }
  };
  s3.getObject({ Bucket: bucket, Key: key }, getObject);
};
