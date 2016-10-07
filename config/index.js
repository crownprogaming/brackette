/*********
 *  This file will export important setup functions, including .env files and mysql connections.
 *******/
//TODO: Check if this is really needed
//TODO: Update database tables
var program = require('commander');
var mysql = require('mysql');
var squel = require('squel');
require('dotenv').config();

module.exports = {
    setup: function() {
        program.version('0.0.1d')
            .option('-d, --createDatabaseTables', "Create the MySql database for this site, default user will be 'root' with '' as password.")
            .option('-s, --seed', 'Seed Database with Dummy Data, will only create a user.')
            .parse(process.argv);

        if (program.createDatabaseTables) {
            console.log("Creating database tables.");
            this._createDatabaseTables();
        }

        // if (program.seed) {
        //     // Seed data base should alwaycreateDatabaseTabless be last command.
        //     this._seedDataBase();
        // }
    },

    getPool: function() {
        var pool = mysql.createPool({
            host: process.env.HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            database: process.env.MYSQL_DB,
            connectionLimit: 10,
            supportBigNumbers: true
        });

        // Do a test.
        pool.getConnection(function(err, connection) {
            if (err) throw err.stack;
            console.log("You are connected to the database as ID " + connection.threadId);
        });

        return pool;
    },

    // 'Private' functions
    _seedDataBase: function() {
        console.log("Seeding database with dummy data.");
        var sql = squel.insert()
            .into('users')
            .setFieldsRows(require('./usersSeed')).toString();
        this.getPool().getConnection(function(err, connection) {
            if (err) {
                console.log(err);
                return;
            }

            //Perform the query
            connection.query(sql, function(err, results) {
                //Release our connection
                connection.release();
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Dummy data was added succesfully!\nYou can run this command again if you would like to add more data\nRun 'node app.js' without '-s' to run the site.");
                process.exit();
            });
        });
    },

    _createDatabaseTables: function() {
        //gROSS but it will do.
        this.getPool().getConnection(function(err, connection) {
            if (err) {
                console.log(err);
                return;
            }

            connection.query("DROP TABLE IF EXISTS `profileinfo`", function(err, results) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Running...");
            });

            connection.query("DROP TABLE IF EXISTS `users`", function(err, results) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Running...");
            });

            var userTableQuery = "CREATE TABLE IF NOT EXISTS `users` (`id` int(11) NOT NULL AUTO_INCREMENT,`name` varchar(150) NOT NULL,`email` varchar(150) NOT NULL,`password` varchar(150) DEFAULT NULL,`resetPasswordToken` varchar(200) DEFAULT NULL,`resetPasswordExpires` datetime DEFAULT NULL,`facebook_token` varchar(255) DEFAULT NULL,`facebook_id` bigint(255) DEFAULT NULL,`google_token` varchar(255) DEFAULT NULL,`google_id` varchar(255) DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;";
            connection.query(userTableQuery, function(err, results) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Running...");
            });

            var profileInfoQuery = "CREATE TABLE IF NOT EXISTS `profileinfo` ( `id` int(11) NOT NULL AUTO_INCREMENT, `userId` int(11) NOT NULL, `profileImg` varchar(150) NOT NULL, `gamerTag` varchar(100) NOT NULL, PRIMARY KEY (`id`), KEY `userId` (`userId`) ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1";
            connection.query(profileInfoQuery, function(err, results) {
                connection.release();
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Running...All done!");
                process.exit();
            });

        });
    }

};