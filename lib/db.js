/**
 * db.js will export important db functions, including .env files and sequelize connections.
 */

var Sequelize = require('sequelize');
require('dotenv').config();

module.exports = {

  getSequelize: function () {
    var seq = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASS, {
      logging: false,
      host: process.env.HOST,
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      }
    });
    // Test database connection.
    seq.authenticate().then(function () {
      global.logger.info('Database connection was succesful.');
    }).catch(function (err) {
      global.logger.fatal('There was a database connection error. Message:' + err.message);
      process.exit(1);
    });
    return seq;
  }

};
