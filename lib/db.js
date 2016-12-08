/**
 * db.js will export important db functions, including .env files and sequelize connections.
 */

var Sequelize = require('sequelize');
require('dotenv').config();

module.exports = {

    getSequelize: function(){
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
        return seq;
    }

};