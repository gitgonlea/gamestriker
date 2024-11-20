const fetch = require('node-fetch');

const { Server, DailyServerVariables } = require('../models');

const saveServerVariables = async () => {
  try {
    // Retrieve active servers from the database
    const servers = await Server.findAll({
      attributes: ['host', 'port', 'id'],
      where: {
        status: 1
      }
    });

    // Iterate through each server
    for (const server of servers) {
      // Fetch server variables
      const varResponse = await fetchVariables(server.host, server.port);

      // Save or update server variables in the database
      await DailyServerVariables.upsert({
        server_id: server.id,
        variables_data: varResponse
      });
    }

    console.log('Server variables saved successfully');
  } catch (error) {
    console.error('Error saving server variables:', error);
  }
};


const fetchVariables = async (host, port) => {
  try {
    const response = await fetch(`https://taringa-cs.com/getServerVariables.php?host=${host}&port=${port}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const serverIP = String(host + ':' + port);
    if (serverIP in data) {
      // Remove unwanted properties from the server object
      delete data[serverIP].players;
      delete data[serverIP].address;
      delete data[serverIP].hostname;
      delete data[serverIP].ismod;
      delete data[serverIP].map;
      delete data[serverIP].teams;
      for (const prop in data[serverIP]) {
        if (prop.startsWith('game_') || prop.startsWith('gq_') || prop.startsWith('map_') || prop.startsWith('num_')) {
          // Delete properties that start with "game_", "gq_", "map_", or "num_"
          delete data[serverIP][prop];
        }
      }
      return JSON.stringify(data[serverIP]);
    } else {
      console.error('Server data not found');
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
};

module.exports = {
  saveServerVariables
}