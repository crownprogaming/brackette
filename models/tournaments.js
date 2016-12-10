/**
 * This is our database table setup for Tournaments.
 * TODO: Add cols that are needed.
 */
var sequelize = require('../lib/db').getSequelize();
var Sequelize = require('sequelize');
var Tournaments = sequelize.define('tournaments', {
  name: {
    type: Sequelize.STRING(150),
    field: 'name',
    allowNull: false
  },
  ownerId: {
    type: Sequelize.INTEGER(),
    field: 'owner_id',
    allowNull: false
  },
  slug: {
    type: Sequelize.STRING(150),
    field: 'slug',
    allowNull: false
  },
  videoGame: {
    type: Sequelize.STRING(150),
    field: 'video_game',
    defaultValue: null
  },
  venueName: {
    type: Sequelize.STRING(150),
    field: 'venue_name',
    defaultValue: null
  },
  venueAddress: {
    type: Sequelize.STRING(150),
    field: 'venue_address',
    defaultValue: null
  },
  videoUrl: {
    type: Sequelize.STRING(150),
    field: 'video_url',
    defaultValue: null
  },
  details: {
    type: Sequelize.STRING(250),
    field: 'venue_address',
    defaultValue: null
  },
  rules: {
    type: Sequelize.STRING(150),
    field: 'venue_address',
    defaultValue: null
  },
  contactInfo: {
    type: Sequelize.STRING(150),
    field: 'venue_address',
    defaultValue: null
  },
  admins: {
    type: Sequelize.ARRAY(Sequelize.DataTypes.DECIMAL),
    field: 'admins',
    allowNull: false
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
  }

});

/**
 * Always add a test tournament
 */
Tournaments.sync({force: true}).then(function () {
  return Tournaments.create({
    name: 'Mel Hype',
    ownerId: 1,
    slug: 'mel-hype',
    admins: [1, 2],
    createdAt: new Date(),
    updateAt: new Date()
  });
}).catch(Sequelize.UniqueConstraintError, function (err) {
    // TODO: Find out what this is ???
  global.logger.error('There was a error with sequelize when attempting to' +
    ' generate the model and seed the database. Message:' + err.message);
});

module.exports = Tournaments;
