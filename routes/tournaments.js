/**
 * Our tournaments routes. This will contain the pages for anything related to tournaments.
 */
var middlewares = require('../lib/middlewares');
var Tournaments = require('../models/Tournaments');

module.exports = function (app) {
  app.get('/tournaments/create', middlewares.isLoggedIn, function (req, res) {
    res.render('new-tournament');
  });

  app.post('/tournaments/create', middlewares.isLoggedIn, middlewares.createTournament);

  app.get('/tournament/:tournamentSlug', function (req, res) {
    var tournamentSlug = req.params.tournamentSlug;
    Tournaments.findOne({where: {slug: tournamentSlug}}).then(function (tournamentResult) {
      if (tournamentResult === null || tournamentResult === [] || tournamentResult === '' ||
          tournamentResult === undefined || tournamentResult === {}) {
        res.render('tournament', {tournament: {}});
        return false;
      }
      res.render('tournament', {tournament: tournamentResult});
    }).catch(function (err) {
      global.logger.error('There was a server error for tournament page. Message:' + err.message);
      res.status(500).send('Server Error');
    });
  });
};
