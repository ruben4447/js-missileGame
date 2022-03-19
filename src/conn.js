const utils = require('./utils.js');
const auth = require('./auth.js');
const Game = require("./Game.js");

class Connection {
  constructor(socket) {
    this.socket = socket;
    this.type = "general";
    this.token = undefined;
    this.username = undefined;
    this._init();
  }

  _init() {
    console.log("[CONNECTION]  New: " + this.socket.id);

    // Allow client to identify themself
    this.socket.on("id", async params => {
      const loc = params.loc, token = params.token;
      let ok = false, response;
      if (token === undefined || auth.exists(token)) {
        this.token = token;
        this.username = auth.get(token);
        ok = true;
        switch (loc) {
          case 0: // Create Account page
            this.type = "create-account";
            response = this._initCreateAccount(params);
            break;
          case 1: // Menu page
            this.type = "menu";
            response = this._initMenu(params);
            break;
          case 2: // Create Game page
            this.type = "create-game";
            response = this._initCreateGame(params);
            break;
          case 3: // Join Game page
            this.type = "join-game";
            response = this._initJoinGame(params);
            break;
          default:
            this.log("<id>: unknown location " + loc);
            ok = false;
        }
      } else {
        if (token !== undefined) auth.remove(token);
      }

      if (ok) {
        this.log(`Conn Type: ${this.type} (${loc})`);
        this.socket.emit("id-ok", response);
      } else {
        this.socket.emit("redirect", "/index.html?unauth");
      }
    });
  }

  /** Init: create-account.html */
  _initCreateAccount() {
    this.socket.on("create-account", async ({ username, password }) => {
      username = username.trim();
      password = password.trim();
      if (username.length === 0 || !utils.createRegex().test(username)) {
        this.socket.emit("alert", `Invalid Username - must match ${utils.createRegex()}`);
      } else if (password.length === 0 || !utils.createRegex().test(password)) {
        this.socket.emit("alert", `Invalid Password - must match ${utils.createRegex()}`);
      } else {
        const users = JSON.parse(await utils.fread("data/_users.json"));
        if (username in users) {
          this.socket.emit("creation-failed");
        } else {
          this.log("Created account: " + username);
          users[username] = password;
          await utils.fwrite("data/_users.json", JSON.stringify(users));
          this.socket.emit("account-created", username);
        }
      }
    });
  }

  /** Init: create-game.html */
  _initCreateGame() {
    this.socket.on("create-game", async ({ name, password }) => {
      name = name.trim();
      password = password.trim();
      if (name.length === 0 || !utils.createRegex().test(name)) {
        this.socket.emit("alert", `Invalid Name - must match ${utils.createRegex()}`);
      } else if (password.length === 0 || !utils.createRegex().test(password)) {
        this.socket.emit("alert", `Invalid Password - must match ${utils.createRegex()}`);
      } else {
        if (Game.all.has(name)) {
          this.socket.emit("creation-failed");
        } else {
          const game = await Game.createGameObject(name, password, Math.random() < 0.5); // Create game
          this.log(`Created game: name=${game.name}; id=${game.id}`);
          Game.all.set(game.name, game);
          await game.writeData(); // Save to file
          this.socket.emit("game-created", { name, id: game.id, code: game.data.vars.general.join_code });
        }
      }
    });
  }

  /** Init: menu.html */
  _initMenu() {
    this.socket.on("gamelist", () => {
      const games = {};
      Game.all.forEach((game, name) => {
        games[name] = { name: game.name, id: game.id, state: game.state, icon: utils.getStateSymbol(game.state) };
      });
      this.socket.emit("gamelist", games);
    });

    return { username: this.username };
  }

  /** Init: join game */
  _initJoinGame(params) {
    const game = Game.getFromID(params.gameID);
    if (game === undefined) {
      return null;
    } else {
      this.socket.on("join-game", async params => {
        if (game.state === "closed" && params.password !== undefined) {
          // Open game
          if (params.password === game.data.vars.general.password) {
            game.state = "open";
            game.player_1 = this.token;
            this.socket.emit("goto-game");
          } else {
            this.socket.emit("alert", `Unable to open game - password is incorrect`);
          }
        } else if (game.state === "open" && typeof params.code === "number") {
          // Join game
          if (params.code === game.data.vars.general.join_code) {
            game.state = "full";
            game.player_2 = this.token;
            this.socket.emit("goto-game");
          } else {
            this.socket.emit("alert", `Unable to join game - game join code is incorrect`);
          }
        }
      });

      return { name: game.name, id: game.id, state: game.state, icon: utils.getStateSymbol(game.state), winner: game.data.vars.winner };
    }
  }

  log(txt) {
    console.log(`[SOCK#${this.socket.id}]  ${txt}`);
  }

  alert(txt) {
    this.socket.emit("alert", txt);
  }
}

class MenuConnection {
  constructor(socket) {
    this.socket = socket;
    this._init();
  }

  _init() {

  }
}

module.exports = { Connection, MenuConnection };