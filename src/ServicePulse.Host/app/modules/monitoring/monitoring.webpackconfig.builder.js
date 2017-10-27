var config = require('./monitoring.webpackconfig.js');

delete config.watch;
delete config.watchOptions;

module.exports = config;