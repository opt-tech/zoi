const http = require('https');
const fs = require('fs');

const sio = require('./shields-io');

module.exports = async function main() {
  console.log('Ganbaru zoi!');

  const badgeParam = getParams();
  let badgeData;
  try {
    badgeData = await getBadgeData(badgeParam);
  } catch (e) {
    console.log('failed `getBadgeData()`\n', e);
    return process.exit(1);
  }

  try {
    await putToS3(badgeData, badgeParam);
  } catch (e) {
    console.log('failed `putToS3()`\n', e);
    return process.exit(1);
  }
}

function getParams() {
  // todo: get params from cli args

  let cro = {};
  const coverage = 15;
  return {
    subject: cro['subject'] || 'subject-cli',
    status: `${coverage}%`,
    color: cro['color'] || 'lightgrey',
    imageType: 'svg'
  };
}

function getBadgeData(params) {
  return new Promise((resolve, reject) => {
    let data = '';
    const url = sio.url(params);

    http.get(url, res => {
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => { resolve(data); });
      res.on('error', err => { reject(err); });
    });
  });
}

const contentTypeOf = imageType => {
  switch (imageType) {
    case 'svg':
      return 'image/svg+xml';
    case 'png':
      return 'image/png';
    default:
      throw new Error('invalid image type.');
  }
};

function putToS3(badgeData, badgeParam) {
  const aws = require('aws-sdk');
  const s3 = new aws.S3({ apiVersion: '2006-03-01' });
  const imageType = badgeParam.imageType;
  const contentType = contentTypeOf(imageType);

  // todo: bucket and path should refer to outside setting file
  const putParam = {
    bucket: 'zoi-public',
    path: 'branch/'
  };

  const params = {
    Key: `${putParam.path}${badgeParam.subject}.${imageType}`,
    ContentType: contentType,
    CacheControl: 'no-cache',
    Body: badgeData,
    Bucket: putParam.bucket
  };

  return new Promise((resolve, reject) => {
    s3.putObject(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}
