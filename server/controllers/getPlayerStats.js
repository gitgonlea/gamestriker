const { Sequelize } = require('sequelize');
const {DailyPlayerData} = require('../models'); // Adjust the import path according to your project structure
const sequelize = require('../db/connect'); // Import sequelize instance

const getPlayerStats = async (req, res) => {
    const { type, server_id } = req.query;
    try {
        let query = '';
        let numOfDays = type === '1' ? 7 : (type === '2' ? 30 : null);
        const Op = Sequelize.Op;

        if (type !== '0') {
            const hours = ['24', '18', '12', '6'];
            let repeated_part = '';
            for (let i = 0; i < numOfDays; i++) {
                if (i === numOfDays - 1) {
                    repeated_part += `
                        WHEN date = CURDATE() THEN '${i + 1}'`;
                } else {
                    repeated_part += `
                        WHEN date = CURDATE() - INTERVAL ${numOfDays - i - 1} DAY THEN '${i + 1}'`;
                }
            }

    const repeatedParts = [];
    const currentDate = new Date(); // Current date for comparison

    // Loop through each hour and generate the repeated part of the query
    hours.forEach((hour, index) => {
        const dateSubquery = `date >= CURDATE() - INTERVAL ${numOfDays} DAY AND date <= CURDATE()`;
        
        const subquery = `
            SELECT 
                CASE ${repeated_part}
                END AS day,
                '${hour}' AS hour,
                hour_${hour} AS Jugadores
            FROM 
                daily_player_data
            WHERE 
                ${dateSubquery}
                AND server_id = :serverId`;

        repeatedParts.push(subquery);
    });
    
    // Concatenate the repeated parts into the query
    query = repeatedParts.join(' UNION ALL');

    // Add ORDER BY clause
    query += " ORDER BY day, FIELD(hour, '24', '22', '20', '18', '16', '14', '12', '10', '8', '6', '4', '2');";

    try {
        // Execute Sequelize query
        const playerStats = await sequelize.query(query, {
            replacements: { serverId: server_id },
            type: Sequelize.QueryTypes.SELECT
        });

        return res.status(200).send(playerStats);
    } catch (error) {
        console.error('Error fetching server data:', error);
        return res.status(500).send('Error fetching server data');
    }
        } else {
            const hours = ['24', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22'];
            const queries = [];
            hours.forEach(hour => {
                queries.push(DailyPlayerData.findOne({
                    attributes: [
                        [Sequelize.literal('1'), 'day'],
                        [Sequelize.literal(`'${hour}'`), 'hour'],
                        [`hour_${hour}`, 'Jugadores']
                    ],
                    where: {
                        date: Sequelize.literal('CURDATE()'),
                        server_id: server_id
                    }
                }));
            });
            const playerStats = await Promise.all(queries);

            if (playerStats.length > 0)
            {
                playerStats.sort((a, b) => {
                    const hourA = a.dataValues.hour;
                    const hourB = b.dataValues.hour;
                    return hours.indexOf(hourA) - hours.indexOf(hourB);
                });
            }

            return res.status(200).send(playerStats);
        }
    } catch (error) {
        console.error('Error retrieving server players:', error);
        return //res.status(500).send('Internal server error');
    }
};

module.exports = {
    getPlayerStats
};
