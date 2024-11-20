const { Sequelize } = require('sequelize');
const { DateTime } = require('luxon');

const moment = require('moment-timezone');

const {Server, PlayerData, DailyPlayerScoreServerData, DailyPlayerTimeServerData} = require('../models');

const { queryGameServerPlayers } = require('./queryGameServerPlayers');
const fetchPlayerData = async (serverInfo) => {
    try {
        const state = await queryGameServerPlayers(serverInfo.host, serverInfo.port);

        //console.log(state)
        return state; // Assuming players are included in the state object
    } catch (error) {
        console.error('Error fetching player data:', error);
        return [];
    }
};

const updatePlayTime = async (serverId) => {
    try {
        
        const servers = await Server.findAll({
            where: { id: serverId },
            attributes: ['id', 'host', 'port']
        });

        if (servers.length < 1) return;

        const server = servers[0];
        const online = 1;
        //let count = 0;

        await PlayerData.update({ online: 0 }, {
            where: {
                server_id: server.id
            }
        });

        const serverInfo = {
            type: 'counterstrike16', // Adjust this according to your game type
            host: server.host,
            port: server.port
        };

        const playerData = await fetchPlayerData(serverInfo);

        if (playerData.length < 1) return;

        const previousPlayerData = await PlayerData.findAll({
            where: {
                server_id: server.id,
                player_name: playerData.map(player => player.name)
            },
            attributes: ['player_name', 'score', 'playtime', 'previous_playtime', 'previous_score', 'BOT', 'last_seen']
        });

        for (const player of previousPlayerData) {
            const playtimeHours = player.playtime / 3600;
            if (playtimeHours > 20 && player.score < 10 && player.BOT !== 1) {
                await PlayerData.update({ BOT: 1 }, {
                    where: {
                        server_id: server.id,
                        player_name: player.player_name
                    }
                });
            }
        }

        const previousPlayerMap = {};
        for (const { player_name, playtime, score, previous_playtime, previous_score, last_seen } of previousPlayerData) {
            previousPlayerMap[player_name] = { playtime, score, previous_playtime, previous_score, last_seen };
        }

        for (const player of playerData) {

            const playerName = player.name;

            const currentPlaytime = player.online;
            const currentScore = player.score;

            // Retrieve the previous playtime and score or default to 0 if not available
            const { playtime: allTimePlaytime = 0, score: allTimeScore = 0, previous_playtime: previousPlaytime = 0, previous_score: previousScore = 0, last_seen: lastSeen} = previousPlayerMap[playerName] || {};


            const currentTime = new Date();
            currentTime.setHours(currentTime.getHours() + 1);
            // Calculate the difference in milliseconds
            const timeDifferenceInMs = currentTime - lastSeen;

            // Convert the difference to minutes
            const timeDifferenceInMinutes = Math.floor(timeDifferenceInMs / (1000 * 60));

            

            // Calculate the actual playtime difference
            let playtimeDifference;
            if (currentPlaytime >= previousPlaytime && timeDifferenceInMinutes < 16) {
                playtimeDifference = Math.max(0, currentPlaytime - previousPlaytime);
            } else {
                
                playtimeDifference = currentPlaytime; // If playtime is less (possibly reset), take the current playtime directly
            }

            // Calculate the actual score difference
            let scoreDifference;
            if (currentScore >= previousScore && currentScore > 0) {

                scoreDifference = Math.max(0, currentScore - previousScore);
            } else {
                scoreDifference = currentScore; // Reset detected, add the current score directly
            }

            scoreDifference = Math.max(0, scoreDifference);
            // Update the new playtime by adding the playtime difference to the previous playtime
            const newPlaytime = allTimePlaytime + playtimeDifference;
            
            // Update the new score by adding the score difference to the previous score
            const newScore = allTimeScore + scoreDifference;
           
            await PlayerData.upsert({
                server_id: server.id,
                player_name: playerName,
                playtime: newPlaytime,
                score: newScore,
                online: online,
                last_seen: Sequelize.fn('NOW'),
                current_playtime: currentPlaytime,
                current_score: currentScore,
                previous_playtime: currentPlaytime,
                previous_score: currentScore > 0 ? currentScore : 0
            });
           
            await updateDailyPlayerData(server.id, 0, newPlaytime, playerName);
            await updateDailyPlayerData(server.id, 1, newScore, playerName);
        }

        //console.log(`Updated ${count} players`);
    } catch (error) {
        console.error('Error updating playtime and score:', error);
    }
};

const updateDailyPlayerData = async (serverId, type, value, playerName) => {
    try {
        const currentDate = moment().tz('America/Argentina/Buenos_Aires').toDate();
        const currentHour = currentDate.getHours();

        if (![24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].includes(currentHour)) {
            return;
        }

        let model;
        if (type === 0) {
            model = DailyPlayerTimeServerData;
        } else {
            model = DailyPlayerScoreServerData;
        }

        await model.findOrCreate({
            where: {
                server_id: serverId,
                date: Sequelize.fn('CURDATE'),
                player_name: playerName
            },
            defaults: {
                server_id: serverId,
                date: Sequelize.fn('CURDATE'),
                [ `hour_${currentHour}`]: value
            }
        });
    } catch (error) {
        console.error(`Error updating daily player ${type ? 'score' : 'time'} data for server ${serverId}: ${error}`);
    }
};

module.exports = {
    updatePlayTime
};
