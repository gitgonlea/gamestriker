const { Server, DailyServerVariables } = require('../models'); // Adjust the import path according to your project structure

const getServerVariables = async (req, res) => {
  try {
    // Find the server by host and port
    const server = await Server.findOne({
      attributes: ['servername', 'id'],
      where: {
        host: req.query.host,
        port: req.query.port
      }
    });

    if (!server) {
      return res.status(404).send('Server not found');
    }

    // Find the daily server variables by server_id
    const dailyServerVariables = await DailyServerVariables.findOne({ where: { server_id: server.dataValues.id } });

    if (!dailyServerVariables) {
      return res.status(404).send('Daily server variables not found');
    }

    // Add host and port to the response
    const varData = {
      ...dailyServerVariables.toJSON(),
      host: req.query.host,
      port: req.query.port,
      servername: server.servername
    };

    return res.status(200).send([varData]);
  } catch (error) {
    console.error('Error retrieving server variables:', error);
    return res.status(500).send('Internal server error');
  }
};

module.exports = {
  getServerVariables
};
