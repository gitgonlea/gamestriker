const express = require('express')
const router = express.Router()

const { addServer } = require('../controllers/addServer');
const { getServers } = require('../controllers/getServers');
const { getPlayer } = require('../controllers/getPlayer');
const { getServerInfo } = require('../controllers/getServerInfo');
const { getServerPlayers } = require('../controllers/getServerPlayers');
const { getPlayerStats } = require('../controllers/getPlayerStats');
const { getRankStats } = require('../controllers/getRankStats');
const { getPlayerDataServer } = require('../controllers/getPlayerDataServer');
const { getServerVariables } = require('../controllers/getServerVariables');

router.route('/addServer').post(addServer)
router.route('/getServers').get(getServers)
router.route('/getPlayer').get(getPlayer)
router.route('/getServerInfo').get(getServerInfo)
router.route('/getServerPlayers').get(getServerPlayers)
router.route('/getPlayerStats').get(getPlayerStats)
router.route('/getRankStats').get(getRankStats)
router.route('/getPlayerDataServer').get(getPlayerDataServer)
router.route('/getServerVariables').get(getServerVariables)

module.exports = router