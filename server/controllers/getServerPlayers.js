const {PlayerData} = require('../models');
const { Sequelize } = require('sequelize');

const getServerPlayers = async (req, res) => {
    const { id, type } = req.query;

    try {
        let players;

        if (type === '1') {
            players = await PlayerData.findAll({
                where: {
                    /*last_seen: {
                        [Sequelize.Op.gte]: Sequelize.literal('NOW() - INTERVAL 150 SECOND')
                    },*/
                    online: 1,
                    server_id: id
                },
                order: [['current_score', 'DESC']]
            });
        } else {
            players = await PlayerData.findAll({
                where: {
                    server_id: id,
                    BOT: 0
                },
                order: [['score', 'DESC']],
                limit: 10
            });
        }
        //console.log(players)
        return res.status(200).send(players);
    } catch (error) {
        console.error('Error retrieving server players:', error);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    getServerPlayers
};
