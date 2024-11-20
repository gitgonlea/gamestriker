const {Server, PlayerData} = require('../models');
const sequelize = require('../db/connect');

const getPlayerDataServer = async (req, res) => {
    let { playerName, host, port, days } = req.query;

    const query = `
    SELECT 
        pd.*,
        s.host,
        s.port,
        s.servername,
        s.status,
        dense_rank_with_filter.rank_id AS rank_id,
        total_ranks.total_ranks_count AS rank_total
    FROM 
        player_data pd
    JOIN 
        servers s ON pd.server_id = s.id
    JOIN 
        (SELECT 
             player_name,
             DENSE_RANK() OVER (ORDER BY playtime DESC) AS rank_id
         FROM 
             player_data
         WHERE 
             server_id = (
                 SELECT id
                 FROM servers
                 WHERE host = :host AND port = :port
             )
        ) AS dense_rank_with_filter
    ON 
        pd.player_name = dense_rank_with_filter.player_name
    CROSS JOIN 
        (SELECT COUNT(*) AS total_ranks_count 
         FROM player_data 
         WHERE server_id = (
                 SELECT id
                 FROM servers
                 WHERE host = :host AND port = :port
             )
        ) AS total_ranks
    WHERE 
     s.host = :host AND s.port = :port AND pd.player_name = :playerName;
    `;

    try {
        // Query to fetch player data
        const replacements = { host, port, playerName };
        const player_data = await sequelize.query(query, { replacements: replacements, type: sequelize.QueryTypes.SELECT });
        

        // Query to fetch daily player data
        const player_time = await getDailyPlayerData(0, player_data[0].server_id, playerName, days);
        const player_score = await getDailyPlayerData(1, player_data[0].server_id, playerName, days);

        return res.status(200).send({ player_data, player_time, player_score });
    } catch (error) {
        console.error('Error fetching players:', error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
};

const getDailyPlayerData = async (type, server_id, player_name, days) => {
    try {
        let players_stats;

        if (days === '0') {
            const hours = ['24', '23', '22', '21', '20', '19', '18', '17', '16', '15', '14', '13', '12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
            const repeatedParts = [];
            hours.forEach((hour, index) => {
                repeatedParts.push(`
                    SELECT 
                        CASE 
                            WHEN date = CURDATE() THEN 1
                        END AS day,
                        '${hour}' AS hour,
                        ${type ? 'hour_' + hour : 'ROUND(hour_' + hour + ' / 60)'} AS ${type ? 'Puntaje' : 'Tiempo'}
                    FROM 
                        daily_player_${type ? 'score' : 'time'}_server_data
                    WHERE 
                        date = CURDATE()
                        AND server_id = ?
                        AND player_name= ?
                        AND hour_${hour} != -1`);
            });

            const queryParameters = [];
            for (let i = 0; i < 24; i++) {
                queryParameters.push(server_id, player_name);
            }

            // Query to fetch repeated daily player data
            [players_stats = []] = await sequelize.query(repeatedParts.join(' UNION ALL'), {
                replacements: queryParameters,
                type: sequelize.QueryTypes.SELECT
            });
        } else {
            const hourColumns = Array.from({ length: 24 }, (_, i) => `hour_${i + 1}`);
            const hourColumnsList = hourColumns.map(hour => `CASE WHEN ${hour} != -1 THEN ${hour} ELSE 0 END`).join(' + ');

            // Query to fetch aggregated daily player data
            const query = `
                SELECT 
                    DAY(date) AS day,
                    (${hourColumnsList}) AS ${type ? 'Puntaje' : 'Tiempo'}
                FROM 
                    daily_player_${type ? 'score' : 'time'}_server_data
                WHERE 
                    server_id = ?
                    AND player_name= ?;
            `;

            [players_stats = []] = await sequelize.query(query, {
                replacements: [server_id, player_name],
                type: sequelize.QueryTypes.SELECT
            });
        }
        return [players_stats];
    } catch (error) {
        console.error('Error retrieving server players:', error);
        return [];
    }
};

module.exports = {
    getPlayerDataServer
};
