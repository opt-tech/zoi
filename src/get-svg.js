const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const http = require('https');
const fs = require('fs');

module.exports = function (url, subject) {
  const id = 'master';
  const imgType = 'svg';
  const tmpFileName = `/tmp/badge_${new Date().getTime()}`;
  const tmpFile = fs.createWriteStream(tmpFileName);

  http.get(url, res => {
    res.pipe(tmpFile);
    res.on('end', () => {
      tmpFile.close();
      fs.readFile(tmpFileName, (err, data) => {
        console.log(err);
        const params = {
          Key: `branch/${subject}.svg`,
          ContentType:'image/svg+xml',
          CacheControl:'no-cache',
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
