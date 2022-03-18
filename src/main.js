const express = require('express');
const socketio = require('socket.io');
const router = require('./router.js');
const utils = require('./utils.js');

const PORT = process.argv.length > 2 ? parseInt(process.argv[2]) : 3000;

const app = express();

app.use(express.urlencoded({ extended: true })); // Read form data
app.use('/', router); // Router - control traffic
app.use(express.static('./public/')); // Directory containing static assets

const server = app.listen(PORT, () => console.log(`[SERVER] Listening on port ${PORT}`));
const io = socketio(server);

io.on("connection", socket => {
  console.log("New Connection: " + socket.id);

  let klass;
  socket.on("create-account", async ({ username, password }) => {
    if (klass === undefined) {
      username = username.trim();
      password = password.trim();
      if (username.length === 0 || !utils.createRegex().test(username)) {
        socket.emit("alert", `Invalid Username - must match ${utils.createRegex()}`);
      } else if (password.length === 0 || !utils.createRegex().test(password)) {
        socket.emit("alert", `Invalid Password - must match ${utils.createRegex()}`);
      } else {
        const users = JSON.parse(await utils.fread("data/_users.json"));
        if (username in users) {
          socket.emit("creation-failed");
        } else {
          console.log("[CREATE]  Created account " + username);
          users[username] = password;
          await utils.fwrite("data/_users.json", JSON.stringify(users));
          socket.emit("account-created", username);
        }
      }
    }
  });
});