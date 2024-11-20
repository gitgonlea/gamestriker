const {DailyRanksData} = require('../models'); // Adjust the import path according to your project structure
const { Sequelize } = require('sequelize');

const getRankStats = async (req, res) => {
    const { server_id } = req.query;
    try {
        const rankStats = await DailyRanksData.findAll({
            attributes: 
            [
                'date',
                ['rank_id', 'Rank']
            ],
            where: {
                server_id: server_id,
                date: {
                    [Sequelize.Op.gte]: Sequelize.literal('DATE_SUB(NOW(), INTERVAL 30 DAY)')
                }
            },
            order: [['date', 'ASC']]
        });

        return res.status(200).send(rankStats);
    } catch (error) {
        console.error('Error retrieving server players:', error);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    getRankStats
};
