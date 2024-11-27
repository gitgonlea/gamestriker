const { generateBanner } = require('./generateBanner');
const { queryGameServer } = require('./queryGameServer');
const { updatePlayTime } = require('./updatePlayTime');
const {Server, DailyMapData, DailyPlayerData} = require('../models')

const { DateTime } = require('luxon');

const moment = require('moment-timezone');

let io;

const setSocketIO = (socketIO) => {
  io = socketIO;
};

const { Sequelize } = require('sequelize');
const sequelize = require('../db/connect'); // Import sequelize instance

const MIN_DELAY_MS = 10 * 1000; // 10 seconds in milliseconds
const MAX_DELAY_MS = 1 * 60 * 1000; // 10 minutes in milliseconds

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const updateServerData = async () => {
    try {
        // Fetch all servers
        const servers = await Server.findAll();

        for (const [index, server] of servers.entries()) {
            const delay = getRandomDelay(MIN_DELAY_MS, MAX_DELAY_MS);
            // Set the delay for processing the server without waiting
            setTimeout(() => {
                processServer(server);
                if (index === servers.length - 1) {
                    const additionalDelay = 1//3 * 60 * 1000; // 1 minute
                    setTimeout(updateServerData, additionalDelay);
                }
            }, delay);
        }
    } catch (error) {
        console.error('Error fetching servers from database:', error);
    }
};

async function processServer(server) {
    try {
        //if(server.id !== 8) return;

        const state = await queryGameServer(server.host, server.port);

        if (state) {
            const data = {
                servername: state.name,
                map: state.map,
                maxplayers: state.maxplayers,
                numplayers: state.players,
                online: 1,
                host: server.host,
                port: server.port,
                rank_id: server.rank_id,
            };

            await updateDailyPlayers(server.id, data.numplayers);
            await updateServerRecord(server.id, data);

            try {
                let dailyPlayers = await getDailyPlayers(server.id);
                dailyPlayers = dailyPlayers.filter(data => data.Jugadores !== -1);

                await updatePlayTime(server.id);
                await generateBanner(data, dailyPlayers);

                if (io) {
                    const address = `${data.host}:${data.port}`
                    io.to(address).emit('serverUpdated');
                }
                
            } catch (error) {
                console.log(error);
            }
        } else {
            let dailyPlayers = await getDailyPlayers(server.id);
            await statusOffLine(server, dailyPlayers);
            console.error(`Failed to update server data for server ${server.servername}: Server is offline`);
        }
    } catch (error) {
        let dailyPlayers = await getDailyPlayers(server.id);
        dailyPlayers = dailyPlayers.filter(data => data.Jugadores !== -1);
        
        await statusOffLine(server, dailyPlayers);
        console.error(`Error updating server data for server ${server.id}: ${error}`);
    }
}


const statusOffLine = async (server, dailyPlayers) => {
    const data = {
        servername: server.servername,
        map: 'Desconocido',
        maxplayers: server.maxplayers,
        numplayers: 0,
        host: server.host,
        port: server.port,
        rank_id: server.rank_id,
        online: 0
    };
    await setServerOffline(server.id)
    try {
        await generateBanner(data, dailyPlayers)
        } catch (error) {
            console.log(error)
        }
}

const updateServerRecord = async (serverId, data) => {
    const nowInBuenosAires = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');
    try {
        const existingData = await Server.findOne({ where: { id: serverId } });
        const existingDataMap = await DailyMapData.findOne({ where: { server_id: serverId, date: Sequelize.literal('CURDATE()') } });
        
        if (existingDataMap && existingDataMap.dataValues.map_data) {
            let existingMapData = JSON.parse(existingDataMap.dataValues.map_data) || {};
           
            const currentMapName = data.map;
            if (currentMapName !== existingData.map || !existingDataMap.map_data) {
                if (existingMapData[currentMapName]) {
                    existingMapData[currentMapName]++;
                } else {
                    existingMapData[currentMapName] = 1;
                }

                const updatedMapData = JSON.stringify(existingMapData);

                await existingDataMap.update({ map_data: updatedMapData });
            }
        } else {

            const newMap = data.map;
            let initialMapData = {};

            if (newMap) {
                initialMapData[newMap] = 1;
            }

            const initialMapDataJson = JSON.stringify(initialMapData);

            await DailyMapData.create({ server_id: serverId, map_data: initialMapDataJson, date: Sequelize.literal('CURDATE()') });
        }

        await Server.update({ servername: data.servername, map: data.map, maxplayers: data.maxplayers, numplayers: data.numplayers, status: 1, last_update: nowInBuenosAires }, { where: { id: serverId } });

        //console.log(`Server data updated successfully for server ${serverId}`);
    } catch (error) {
        console.error(`Error updating server data for server ${serverId}: ${error}`);
    }
};

const updateDailyPlayers = async (serverId, players) => {

    const currentDate = moment().tz('America/Argentina/Buenos_Aires').toDate();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    if (![24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2].includes(currentHour) || currentMinute > 10) {
        return; 
    }

    try {
        // Use upsert to insert or update the record
        await DailyPlayerData.upsert({
            date: Sequelize.fn('CURDATE'), // Use Sequelize.fn to ensure the date is handled correctly
            [`hour_${currentHour}`]: players,
            server_id: serverId
        });
    } catch (error) {
        console.error(`Error updating server data for server ${serverId}: ${error}`);
    }
}

const getDailyPlayers = async (server_id) => {
    try {
        const hours = ['24', '22', '20', '18', '16', '14', '12', '10', '8', '6', '4', '2'];
        const queries = hours.map(hour => `SELECT CASE WHEN date = CURDATE() THEN 1 END AS day, '${hour}' AS hour, hour_${hour} AS Jugadores FROM daily_player_data WHERE date = CURDATE() AND server_id = ${server_id}`);
        const query = queries.join(' UNION ALL ') + " ORDER BY day, FIELD(hour, '24', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22');";
        
        const [players_stats] = await sequelize.query(query);

        return players_stats;
    } catch (error) {
        console.error('Error retrieving server players:', error);
        return [];
    } 
}

const setServerOffline = async (server_id) => {
    try {
        await Server.update({ status: 0, map: 'Desconocido', numplayers: 0 }, { where: { id: server_id } });
    } catch (error) {
        console.error(`Error updating server data for server ${server_id}: ${error}`);
    } 
}

module.exports = {
    updateServerData, setSocketIO
}