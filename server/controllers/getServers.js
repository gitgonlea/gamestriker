const { Sequelize, Op } = require('sequelize');
const { Server, DailyServerVariable } = require('../models');

const sequelize = require('../db/connect'); // Import sequelize instance


const getServers = async (req, res) => {
    let { page, pageSize, name, map, ip, varKey, varValue, orderBy, orderDirection } = req.query;

    // Set default values if page or pageSize is not provided
    page = page ? parseInt(page) : 1;
    pageSize = pageSize ? parseInt(pageSize) : 5;
    orderBy = orderBy || 'numplayers'; // Default order by rank_id if no order parameter provided
    orderDirection = orderDirection !== undefined ? orderDirection === 'false' : true;

    const offset = (page - 1) * pageSize;
    let query = '';
    let query_servers = '';
    const queryParams = [];

    if (varKey) {
        const jsonKey = `$.${varKey}`;

        if (varValue) {
            // If varValue is not empty, search for servers with both key and value
            query_servers = `SELECT s.*
                            FROM servers s
                            JOIN daily_server_variables dsv ON s.id = dsv.server_id
                            WHERE JSON_EXTRACT(dsv.variables_data, ?) = ?`;
            queryParams.push(`${jsonKey}`);
            queryParams.push(`${varValue}`);
        } else {
            // If varValue is empty, search for servers with the specified key
            query_servers = `SELECT s.*
                            FROM servers s
                            JOIN daily_server_variables dsv ON s.id = dsv.server_id
                            WHERE JSON_CONTAINS_PATH(dsv.variables_data, 'one', ?)`;
            queryParams.push(`${jsonKey}`);
        }
    } else {
        // No varKey provided, search by other criteria
        query_servers = 'SELECT * FROM servers';

        if (name) {
            query += ' WHERE servername LIKE ?';
            queryParams.push(`%${name}%`);
        } else if (map) {
            query += ' WHERE map LIKE ?';
            queryParams.push(`%${map}%`);
        } else if (ip) {
            const [host, port] = ip.split(':');
            if (host && port) {
                query += ' WHERE host = ? AND port = ?';
                queryParams.push(host, parseInt(port));
            } else {
                query += ' WHERE host LIKE ?';
                queryParams.push(`%${ip}%`);
            }
        }
    }
    query_servers += query
    try {
        let final_query = "";
    
        if (varKey) {
            final_query = `SELECT COUNT(*) AS total FROM (${query_servers}) AS subq`;
        } else 
        {
            final_query = `SELECT COUNT(*) as total FROM servers`
        }
    
        query_servers += ` ORDER BY 
                    CASE 
                      WHEN map = 'Desconocido' THEN 1 
                      ELSE 0 
                    END, 
                    ${orderBy} ${orderDirection ? 'DESC' : 'ASC'} 
                  LIMIT ? OFFSET ?`;
    
        const [countResult] = await sequelize.query(final_query + query, {
            replacements: queryParams,
            type: Sequelize.QueryTypes.SELECT
        });
    
        const totalRecords = countResult ? countResult.total : 0;
        const totalPages = Math.ceil(totalRecords / pageSize);
    
        const servers = await sequelize.query(query_servers, {
            replacements: [...queryParams, pageSize, offset],
            type: Sequelize.QueryTypes.SELECT
        });
    
        return res.status(200).send({ servers, totalPages });
    } catch (error) {
        console.error('Error fetching servers:', error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getServers
};