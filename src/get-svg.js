const aws = require('aws-sdk');
aws.config.update({ accessKeyId: '', secretAccessKey: '' });
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const http = require('https');
const fs = require('fs');

const url = `https://img.shields.io/badge/front--coverage-100%25-green.svg`
const id = 'master';
const imgType = 'svg';
const tmpFileName = `./badge_${new Date().getTime()}`;
const tmpFile = fs.createWriteStream(tmpFileName);

module.exports = function () {
  http.get(url, res => {
    res.pipe(tmpFile);
    res.on('end', () => {
      tmpFile.close();
      fs.readFile(tmpFileName, (err, data) => {
        const params = {
          Key: `hgoe.svg`,
          Body: data,
          Bucket: 'zoi-public'
        };
        s3.putObject(params, (err, data) => {
          console.log(err);
          console.log(data)
        });
      });
    });
  });
}
