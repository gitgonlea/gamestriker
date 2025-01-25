const { Sequelize } = require('sequelize');
const { DateTime } = require('luxon');

const moment = require('moment-timezone');

const {Server, PlayerData, DailyPlayerScoreServerData, DailyPlayerTimeServerData} = require('../models');

const { queryGameServerPlayers } = require('./queryGameServerPlayers');
const fetchPlayerData = async (serverInfo) => {
    try {
        const state = await queryGameServerPlayers(serverInfo.host, serverInfo.port);
        return state; // Assuming players are included in the state object
    } catch (error) {
        console.error('Error fetching player data:', error);
        return [];
    }
};

const updatePlayTime = async (serverId) => {

    //if(serverId !== 33) return
    try {
        const servers = await Server.findAll({
            where: { id: serverId },
            attributes: ['id', 'host', 'port']
        });

        if (servers.length < 1) return;
    
        const server = servers[0];
        const online = 1;
    
        // Mark all players offline before updating
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
    
        // Fetch previous player data
        const previousPlayerData = await PlayerData.findAll({
            where: {
                server_id: server.id,
                player_name: playerData.map(player => player.name)
            },
            attributes: ['player_name', 'score', 'playtime', 'previous_playtime', 'previous_score', 'BOT', 'last_seen']
        });
        
        const previousPlayerMap = {};
        for (const { player_name, playtime, score, previous_playtime, previous_score, last_seen } of previousPlayerData) {
            previousPlayerMap[player_name] = { playtime, score, previous_playtime, previous_score, last_seen };
        }
    
        for (const player of playerData) {
            const playerName = player.name;
            const currentPlaytime = player.online;
            const currentScore = player.score;
    
            // Retrieve the previous player state
            const {
                playtime: allTimePlaytime = 0,
                score: allTimeScore = 0,
                previous_playtime: previousPlaytime = 0,
                previous_score: previousScore = 0,
                last_seen: lastSeen
            } = previousPlayerMap[playerName] || {};
    
            const currentTime = new Date();
            const lastSeenTime = lastSeen ? new Date(lastSeen) : null;
    
            let playtimeDifference = 0;
            let scoreDifference = 0;
    
            // Calculate playtime only if last seen is recent
            if (lastSeenTime && (currentTime - lastSeenTime) / (1000 * 60) < 16) {
                if (currentPlaytime >= previousPlaytime) {
                    playtimeDifference = currentPlaytime - previousPlaytime;
                }
            } else {
                playtimeDifference = currentPlaytime; // Assume reset if last seen is too old
            }
    
            // Calculate score difference
            if (currentScore >= previousScore) {
                scoreDifference = currentScore - previousScore;
            } else {
                scoreDifference = currentScore; // Assume reset if score decreased
            }
    
            const newPlaytime = allTimePlaytime + playtimeDifference;
            const newScore = allTimeScore + scoreDifference;
    
            // Upsert player data
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
                previous_score: currentScore
            });
    
            await updateDailyPlayerData(server.id, 0, newPlaytime, playerName); // Playtime update
            await updateDailyPlayerData(server.id, 1, newScore, playerName);   // Score update
        }
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
