'use strict';

const handler = require('./index').handler;
const event = {
  Records: [
    {
      s3: {
        bucket: {
          name: 'zoi-coverage'
        },
        object: {
          key: 'summary1482217809336.json'
        }
      }
    }
  ]
};
const context = {
  done(arg1, arg2) {
    console.log('context.done!', arg1, arg2);
  }
};
handler(event, context);
