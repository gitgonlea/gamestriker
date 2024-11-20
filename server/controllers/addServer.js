const {Server} = require('../models'); // Adjust the import path according to your project structure
const { generateBanner } = require('./generateBanner');
const { queryGameServer } = require('./queryGameServer');

const addServer = async (req, res) => {
    try {
        const host = req.body.host; 
        const [ip, port] = host.split(':');

        const state = await queryGameServer(ip, parseInt(port, 10));

        if (state) {
            const data = {
                host: ip,
                port: port,
                servername: state.name,
                map: state.map,
                maxplayers: state.maxplayers,
                numplayers: state.numplayers
            };

            const serverExists = await checkServerExists(data.host, data.port);

            if (serverExists) {
                return res.status(200).send('duplicated');
            }

            try {
                const server = await Server.create(data);

                // Update rank_id with the last inserted id
                await server.update({ rank_id: server.id });

                const playerStatsFake = [
                    { day: 1, hour: '24', Jugadores: 0 },
                    { day: 1, hour: '6', Jugadores: 0 }
                ];

                await generateBanner(data, playerStatsFake);

                return res.status(200).send(data);
            } catch (error) {
                console.error('Error inserting data:', error);
                return res.status(500).send('Internal Server Error');
            }
        } else {
            return res.status(200).send('fail');
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
};

const checkServerExists = async (host, port) => {
    try {
        const server = await Server.findOne({ where: { host, port } });
        return server !== null;
    } catch (error) {
        console.error('Error checking server existence:', error);
        return false; // Assume server doesn't exist in case of error
    }
};

module.exports = {
    addServer
};
