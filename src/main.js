const express = require('express');
const socketio = require('socket.io');
const router = require('./router.js');
const Game = require("./Game.js");
const conn = require('./conn.js');
const utils = require('./utils.js');

const PORT = process.argv.length > 2 ? parseInt(process.argv[2]) : 3000;

const app = express();

app.use(express.urlencoded({ extended: true })); // Read form data
app.use('/', router); // Router - control traffic
app.use(express.static('./public/')); // Directory containing static assets

const server = app.listen(PORT, async () => {
  console.log(`[SERVER]  Setting up...`);
  await Game.loadAll(); // Load all game files
  console.log(`[SERVER]  ... Loaded ${Game.all.size} game(s)`);
  console.log(`[SERVER]  Finished. ${JSON.stringify(server.address())}`);
});
const io = socketio(server);

io.on("connection", socket => {
  new conn.Connection(socket);
});

// Handle exits - ensure graceful shutdown
const exitHandler = utils.handleTermination(server, {
  coredump: false,
  timeout: 500,
  log: true,
  fn: async () => {
    console.log(`[SERVER]: preparing to shut down...`);
    for (let [name, game] of Array.from(Game.all)) {
      game.state = "closed";
      await game.writeData();
    }
    console.log(`[SERVER]: shutting down...`);
  }
});

// Exit handler triggers
process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));