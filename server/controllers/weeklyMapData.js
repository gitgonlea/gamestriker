const { WeeklyMapData, DailyMapData } = require('../models')

const { Op } = require('sequelize');

const weeklyMapData = async () => {
    try {
        // Fetch daily map data within the last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const dailyMapData = await DailyMapData.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // Aggregate daily map data
        const aggregatedResults = aggregateResults(dailyMapData);

        // Bulk insert or update aggregated data into weekly_map_data table
        await Promise.all(aggregatedResults.map(async (result) => {
            const serverId = result.serverId;
            const mapData = JSON.stringify(result.mapData); // Convert mapData to JSON string
        
            // Check if the server_id already exists in the weekly_map_data table
            const existingRecord = await WeeklyMapData.findOne({ where: { server_id: serverId } });
        
            if (existingRecord) {
                // If the record already exists, update its map_data
                await WeeklyMapData.update({ map_data: mapData }, { where: { server_id: serverId } });
            } else {
                // If the record doesn't exist, insert a new record
                await WeeklyMapData.create({ server_id: serverId, map_data: mapData });
            }
        }));        

    } catch (error) {
        console.error("Error updating weekly map data:", error);
    }
};

function aggregateResults(results) {
    // Aggregate results for each server_id
    const mapCountsByServer = new Map();

    results.forEach(result => {
        const serverId = result.server_id;
        const mapData = JSON.parse(result.map_data); // Parse JSON string to object

        if (!mapCountsByServer.has(serverId)) {
            mapCountsByServer.set(serverId, new Map());
        }

        const mapCounts = mapCountsByServer.get(serverId);

        for (const mapEntry of Object.entries(mapData)) {
            const [mapName, count] = mapEntry;

            if (mapCounts.has(mapName)) {
                mapCounts.set(mapName, mapCounts.get(mapName) + count);
            } else {
                mapCounts.set(mapName, count);
            }
        }
    });

    // Convert aggregated results to array format
    const aggregatedResults = [];
    for (const [serverId, mapCounts] of mapCountsByServer.entries()) {
        const sortedMapCounts = Array.from(mapCounts.entries())
            .sort((a, b) => b[1] - a[1]);

        const slicedMapCounts = sortedMapCounts.slice(0, 5);

        const mapData = [];
        let othersCount = 0;
        let totalCount = 0;

        slicedMapCounts.forEach(([mapName, count]) => {
            totalCount += count;
            mapData.push({ name: mapName, count, value: 0 });
        });

        for (let i = 5; i < sortedMapCounts.length; i++) {
            othersCount += sortedMapCounts[i][1];
            totalCount += sortedMapCounts[i][1];
        }

        if (othersCount > 0) {
            mapData.push({ name: 'otros', count: othersCount, value: 0 });
        }

        mapData.forEach(entry => {
            entry.value = parseInt((entry.count / totalCount) * 100);
        });

        aggregatedResults.push({ serverId, mapData });
    }

    return aggregatedResults;
}

module.exports = {
    weeklyMapData
};
