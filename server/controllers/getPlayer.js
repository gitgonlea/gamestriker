const { Sequelize, Op } = require('sequelize');

const {Server, PlayerData} = require('../models');

const getPlayer = async (req, res) => {
    let { page, pageSize, name, orderBy, orderDirection, online } = req.query;

    // Set default values if page or pageSize is not provided
    page = page ? parseInt(page) : 1;
    pageSize = pageSize ? parseInt(pageSize) : 10;
    orderBy = orderBy || 'online'; // Default order by online if no order parameter provided
    orderDirection = orderDirection !== undefined ? orderDirection === 'true' : true;

    if (orderBy === 'name') {
        orderBy = 'player_name';
    } else if (orderBy === 'time') {
        orderBy = 'playtime';
    } else {
        orderBy = 'online';
    }

    const offset = (page - 1) * pageSize;

    const whereConditions = {};
    const order = [[orderBy, orderDirection ? 'DESC' : 'ASC']];

    if (name) {
        whereConditions.player_name = { [Op.like]: `%${name}%` };
    }

    if (online === 'true') {
        whereConditions.online = 1;
    }

    try {
        const { count, rows } = await PlayerData.findAndCountAll({
            where: whereConditions,
            include: [{
                model: Server,
                attributes: ['servername', 'host', 'port'],
            }],
            order: order,
            limit: pageSize,
            offset: offset
        });

        const modifiedRows = rows.map(row => {
            const serverData = row.Server ? row.Server.toJSON() : {}; // Extract Server data if available
            
            return {
                ...row.toJSON(), // Convert PlayerData row to JSON and spread its properties
                ...serverData // Spread Server data
            };
        });

        delete modifiedRows[0].Server; // Remove Server property

        //console.log(modifiedRows)

        const totalPages = Math.ceil(count / pageSize);

        return res.status(200).send({ players: modifiedRows, totalPages });
    } catch (error) {
        console.error('Error fetching players:', error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getPlayer
};
