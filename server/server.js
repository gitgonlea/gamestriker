const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const servers = require('./routes/servers');

const { updateServerData, setSocketIO } = require('./controllers/updateServers');
const { updateRanks } = require('./controllers/updateRanks');
const { weeklyMapData } = require('./controllers/weeklyMapData');
const { saveServerVariables } = require('./controllers/saveServerVariables');

const cron = require('node-cron');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  origin: '*',
  transports: ['websocket', 'polling'],  // Allow WebSocket and polling as fallback
});

// Set up Socket.IO instance
setSocketIO(io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

app.use('/argstrike/api/v1/servers', servers);

// Serve static files from the server folder
const serverFolderPath = path.join(__dirname, '..', '..', 'public_html', 'server_info');
app.use(express.static(serverFolderPath, { maxAge: 0 }));

const UPDATE_INTERVAL = 15 * 60 * 1000;

// Server start function
const start = async () => {
  try {
    process.env.TZ = 'America/Argentina/Buenos_Aires';
    server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

    io.on('connection', (socket) => {
      socket.on('watchServer', (serverId) => {
        socket.join(serverId);
      });
    });

    updateServerData(io);

    // Schedule tasks with cron
    cron.schedule('0 0 * * 0', () => {
      weeklyMapData();
    });
    cron.schedule('0 6,18 * * *', () => {
      updateRanks();
    });
    cron.schedule('0 0 * * *', () => {
      saveServerVariables();
    });

    updateRanks();

  } catch (error) {
    console.error('Server start error:', error);
  }
};

start();
