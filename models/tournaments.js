/********
 * This is our custom database queries for Tournaments, pulls in data about the tournaments
 *********/
var sequelize = require('../config').getSequelize();
var Sequelize = require('sequelize');
var Tournaments = sequelize.define('tournaments', {
    name: {
        type: Sequelize.STRING(150),
        field: 'name',
        allowNull: false,
    },
    ownerId: {
        type: Sequelize.INTEGER(11),
        field: 'owner_id',
        allowNull: false,
    },
    slug: {
        type: Sequelize.STRING(150),
        field: 'slug',
        allowNull: false
    },
    videoGame: {
        type: Sequelize.STRING(150),
        field: 'video_game',
        defaultValue: null,
    },
    venueName: {
        type: Sequelize.STRING(150),
        field: 'venue_name',
        defaultValue: null,
    },
    venueAddress: {
        type: Sequelize.STRING(150),
        field: 'venue_address',
        defaultValue: null,
    },
    videoUrl: {
        type: Sequelize.STRING(150),
        field: 'video_url',
        defaultValue: null,
    },
    details: {
        type: Sequelize.STRING(250),
        field: 'venue_address',
        defaultValue: null,
    },
    rules: {
        type: Sequelize.STRING(150),
        field: 'venue_address',
        defaultValue: null,
    },
    contactInfo: {
        type: Sequelize.STRING(150),
        field: 'venue_address',
        defaultValue: null,
    },
    startAt: {
        type: Sequelize.DATE,
        field: 'start_date',
        defaultValue: null
    },
    endDate: {
        type: Sequelize.DATE,
        field: 'end_date',
        defaultValue: null
    },

});
Tournaments.sync();
module.exports = Tournaments;