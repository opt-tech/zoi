'use strict'

const apiRoot = 'https://img.shields.io/badge/';
const convert4sio = str => str.replace(/-/g, '--').replace(/_/g, '__');
const toUrl = (subject, status, color, imageType) => {
  const name = encodeURIComponent(`${subject}-${status}-${color}.${imageType}`);
  return `${apiRoot}${name}`;
};

module.exports = {
  url(param) {
    const subject = convert4sio(param.subject);
    const status = convert4sio(param.status);
    const color = convert4sio(param.color);
    return toUrl(subject, status, color, param.imageType);
  }
}
