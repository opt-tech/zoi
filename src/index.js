'use strict'

console.log("Ganbaru zoi")
const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});

// s3://zoi-coverage/
//    -- report/master.json
// s3://zoi-public/
//    -- branch/master.png
//    -- images/*.png

exports.handler = (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  s3.getObject({
      Bucket: bucket,
      Key: key
    },
    (err, data) => {
      if (err) {
        context.done('error', `error getting file${err}`);
      } else {
        console.log(`data:${JSON.stringify(data, null, ' ')}`);
        try {
          // Coverage Report Object
          const cro = JSON.parse(data.Body);
          if (cro.coverage) {
            const coverage = Number(cro.coverage);
            if (isNaN(coverage)) {
              throw `property 'coverage' is not a number`;
            }
            const rounded = Math.round(coverage);
            if (rounded < 0 || 100 < rounded) {
              throw `property 'coverage' out of range:${rounded}`;
            }
            console.log(`coverage:${rounded}!!`); //FIXME

            // copy image
            const bucket = 'zoi-public';
            const branch = 'master';
            const imgType = 'svg';
            const copySource = `${bucket}/image/front--coverage-${rounded}.${imgType}`;
            const params = {
              CopySource: copySource,
              Bucket: bucket,
              Key: `branch/${branch}.${imgType}`
            };
            s3.copyObject(params, (err, data) => {
              if (err) { // an error occurred
                console.error(err, err.stack);
              } else { // successful response
                console.log(data);
              };
            });

          } else {
            throw `property 'coverage' not found`;
          }
        } catch (e) {
          context.done('error', `Invalid CRO format, ${e}: ${data.Body}`);
        }
      }
    }
  );
};
