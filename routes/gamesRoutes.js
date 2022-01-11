const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn } = require('./../middleware')
const games = require('./../controllers/games')

router.route('/game')
    .get(isLoggedIn, games.game)
    .post(isLoggedIn, games.game)

router.route('/game2')
    .get(isLoggedIn, games.game2)
    .post(isLoggedIn, games.game2)

module.exports = router;