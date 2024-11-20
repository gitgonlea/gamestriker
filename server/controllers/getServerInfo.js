const {Server, ServerRanks, WeeklyMapData, DailyPlayerData} = require('../models')

const { Sequelize } = require('sequelize');
const sequelize = require('../db/connect'); // Import sequelize instance

const getServerInfo = async (req, res) => {
    try {
        const server = await Server.findOne({
            where: {
                host: req.query.host,
                port: req.query.port
            },
            include: [
                {
                    model: ServerRanks,
                    attributes: ['lowest_rank', 'highest_rank'],
                    required: false
                },
                {
                    model: WeeklyMapData,
                    attributes: ['map_data']
                }
            ]
        });

        if (!server) {
            return res.status(404).send('Server not found.');
        }

        if (server.ServerRanks.length < 1) {
            server.dataValues.ServerRanks = {
                0: {
                    lowest_rank: 0,
                    highest_rank: 0
                }
            };
        }

        //console.log(server)
        if (server.WeeklyMapData[0] && server.WeeklyMapData[0].map_data) {
            // Parse map_data attribute into an object
            server.WeeklyMapData[0].map_data = JSON.parse(server.WeeklyMapData[0].map_data);
        
            // Now you can access the parsed map_data
            //console.log(server.WeeklyMapData[0].map_data);
        } else 
        {
            server.dataValues.WeeklyMapData = {
                0: {
                    map_data: {}
                }
            };
        }


        const rankCount = await Server.count({
            where: {
                rank_id: {
                    [Sequelize.Op.gte]: server.rank_id
                }
            }
        });

        const serverCount = await Server.count();

        const percentile = (rankCount / serverCount) * 100;
        server.dataValues.percentile = Math.round(percentile);

        const monthlyAvgPlayers = await DailyPlayerData.findOne({
            attributes: [
                [Sequelize.literal('(hour_24 + hour_18 + hour_12 + hour_6)'), 'total_sum']
            ],
            where: {
                server_id: server.id
            }
        });

        server.dataValues.monthly_avg = monthlyAvgPlayers ? Math.round(monthlyAvgPlayers.total_sum / 4) : -1;

        return res.status(200).send([server]);
    } catch (error) {
        console.error('Error fetching server details:', error);
        return res.status(500).send('Error fetching server details');
    }
};

module.exports = {
    getServerInfo
};
