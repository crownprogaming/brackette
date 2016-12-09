var path = require('path');
var rootPath = path.join(__dirname, '..');

module.exports = {
  root: rootPath,
  assets: path.join(rootPath, '/public'),
  lib: path.join(rootPath, '/bower_components'),
  fav: path.join(rootPath, '/public/img/logo-favicon.ico')
};
