const fs = require('fs');
const path = require('path');

module.exports = (jsonPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(process.cwd(), jsonPath), (err, data) => {
      if (err) return reject(err);
      try {
        return resolve(JSON.parse(data.toString()));
      } catch (e) {
        return reject(e);
      }
    });
  });
};
