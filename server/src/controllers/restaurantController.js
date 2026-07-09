const restaurantService = require('../services/restaurantService');

function getRestaurantInfo(req, res) {
  res.json(restaurantService.getRestaurantInfo());
}

function updateRestaurantInfo(req, res) {
  res.json(restaurantService.updateRestaurantInfo(req.body));
}

module.exports = {
  getRestaurantInfo,
  updateRestaurantInfo
};
