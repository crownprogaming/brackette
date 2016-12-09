var log4js = require('log4js');
var moment = require('moment');
log4js.configure({
  appenders: [
    { type: 'console' },
    {
      type: 'file',
      filename: 'logs/log-' + moment().format('YYYY-MM-DD') + '.log',
      category: 'brackette-logger'
    }
  ]
});
module.exports = log4js.getLogger('brackette-logger');
