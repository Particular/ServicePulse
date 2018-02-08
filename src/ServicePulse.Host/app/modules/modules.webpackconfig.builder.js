var config = require('./modules.webpackconfig.js');

delete config.watch;
delete config.watchOptions;

module.exports = config;