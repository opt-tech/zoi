const http = require('https');
const fs = require('fs');

const sio = require('./shields-io');
const readBadgeJson = require('./read-badge-json');

module.exports = async function main() {
  console.log('Ganbaru zoi!');
  const args = getArgs();

  let badgeParam;
  try {
    badgeParam = await readBadgeJson(args.jsonFile);
  } catch (e) {
    console.log('invalid json file\n', e);
    return process.exit(1);
  }

  let badgeData;
  try {
    badgeData = await getBadgeData(badgeParam);
  } catch (e) {
    console.log('failed `getBadgeData()`\n', e);
    return process.exit(1);
  }

  try {
    await putToS3(buildPutParams(badgeData, badgeParam, getConfig(args.config)));
  } catch (e) {
    console.log('failed `putToS3()`\n', e);
    return process.exit(1);
  }
}

function getArgs() {
  const commandLineArgs = require('command-line-args');
  const optionDefinitions = [
    { name: 'jsonFile', type: String },
    { name: 'config', type: String },
  ];
  try {
    return commandLineArgs(optionDefinitions);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
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

function buildPutParams(badgeData, badgeParam, s3Config) {
  const imageType = badgeParam.imageType;
  const contentType = contentTypeOf(imageType);

  const params = {
    Key: `${s3Config.path}${badgeParam.subject}.${imageType}`,
    ContentType: contentType,
    CacheControl: 'no-cache',
    Body: badgeData,
    Bucket: s3Config.bucket
  };
  return params;
}

function putToS3(params) {
  const aws = require('aws-sdk');
  const s3 = new aws.S3({ apiVersion: '2006-03-01' });

  return new Promise((resolve, reject) => {
    s3.putObject(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

function getConfig(configPath = './zoi.config.js') {
  const path = require('path');
  return require(path.resolve(process.cwd(), configPath))();
}
