const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const http = require('https');
const fs = require('fs');

const sio = require('./shields-io');

const contentTypeOf = imageType => {
  switch (imageType) {
    case 'svg':
      return 'image/svg+xml';
    case 'png':
      return 'image/png';
    default:
      return null;
  }
};

module.exports = function (badgeParam, badgeName) {
  const imageType = badgeParam.imageType;
  const tmpFileName = `/tmp/badge_${new Date().getTime()}`;
  const tmpFile = fs.createWriteStream(tmpFileName);

  const putParam = {
    bucket: 'zoi-public',
    path: 'branch/'
  };
  const contentType = contentTypeOf(imageType);
  const putToS3 = () => {
    tmpFile.close();
    fs.readFile(tmpFileName, (err, data) => {
      console.log(err);
      const params = {
        Key: `${putParam.path}${badgeName}.${imageType}`,
        ContentType: contentType,
        CacheControl: 'no-cache',
        Body: data,
        Bucket: putParam.bucket
      };
      s3.putObject(params, (err, data) => {
        console.log(err);
        console.log(data)
      });
    });
  };

  const url = sio.url(badgeParam);
  http.get(url, res => {
    res.pipe(tmpFile);
    res.on('end', putToS3);
  });
}
