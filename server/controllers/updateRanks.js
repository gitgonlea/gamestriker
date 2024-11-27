const {Server, PlayerData, DailyRanksData, ServerRanks} = require('../models')
const { Sequelize } = require('sequelize');
const sequelize = require('../db/connect'); // Import sequelize instance
const moment = require('moment-timezone');

const updateRanks = async () => {
    try {
        const servers = await PlayerData.findAll({
            attributes: ['server_id', [sequelize.fn('SUM', sequelize.col('playtime')), 'total_playtime']],
            where: {
                BOT: 0
            },
            group: ['server_id'],
            order: [[sequelize.literal('total_playtime'), 'DESC']]
        });

        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];
            const rank = i + 1;

            await updateServerRank(server.server_id, rank);
        }
    } catch (error) {
        console.error('Error updating ranks:', error);
    }
};

const updateServerRank = async (serverId, rank) => {
    try {
        await Server.update({ rank_id: rank }, {
            where: { id: serverId }
        });

        await DailyRanksData.upsert({
            server_id: serverId,
            rank_id: rank,
            date: sequelize.literal('CURDATE()')
        });

        await updateHighLow(serverId, rank);
    } catch (error) {
        console.error(`Error updating server rank for server ${serverId}: ${error}`);
    }
};

const updateHighLow = async (serverId, rank) => {
    const currentDate = moment().tz('America/Argentina/Buenos_Aires').toDate();

    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    try {
        // Find or create the record
        const [result, created] = await ServerRanks.findOrCreate({
            where: { server_id: serverId, month: currentMonth, year: currentYear },
            defaults: { server_id: serverId, month: currentMonth, year: currentYear }
        });

        let highestRank = result.highest_rank || rank;
        let lowestRank = result.lowest_rank || rank;

        // Update highest and lowest ranks if necessary
        if (rank > highestRank) {
            highestRank = rank;
        }

        if (rank < lowestRank) {
            lowestRank = rank;
        }

        // Update the record
        await ServerRanks.update(
            { lowest_rank: lowestRank, highest_rank: highestRank },
            { where: { server_id: serverId, month: currentMonth, year: currentYear } }
        );
    } catch (error) {
        console.error('Error updating high and low ranks:', error);
    }
};


module.exports = {
    updateRanks
};
