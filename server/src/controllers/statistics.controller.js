const statisticsService = require('../services/statistics.service');

function getStatistics(req, res) {
  res.json(statisticsService.getStatistics({
    type: req.query.type,
    date: req.query.date
  }));
}

module.exports = { getStatistics };
