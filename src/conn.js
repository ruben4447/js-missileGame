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
          case 4: // Game page
            this.type = "game";
            response = await this._initPlayGame(params);
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
            game.player_1 = this;
            this.socket.emit("goto-game");
          } else {
            this.socket.emit("alert", `Unable to open game - password is incorrect`);
          }
        } else if (game.state === "open" && typeof params.code === "number") {
          // Join game
          if (params.code === game.data.vars.general.join_code) {
            game.state = "full";
            game.player_2 = this;
            this.socket.emit("goto-game");
          } else {
            this.socket.emit("alert", `Unable to join game - game join code is incorrect`);
          }
        }
      });

      return { name: game.name, id: game.id, state: game.state, icon: utils.getStateSymbol(game.state), winner: game.data.vars.winner };
    }
  }

  /** Init: game.html */
  async _initPlayGame(params) {
    const game = Game.getFromID(params.gameID);
    if (game === undefined || !(params.token === game.player_1.token || params.token === game.player_2.token) || (game.state === "closed" && params.token !== game.player_1.token)) {
      return null;
    } else {
      const isAdmin = params.token === game.player_1.token;
      const me = isAdmin ? "player_1" : "player_2";

      if (me === "player_1") game.player_1 = this;
      else if (me === "player_2") game.player_2 = this;

      // LEAVE GAME
      this.socket.on("disconnect", async () => {
        this.log(`${me} : disconnected`);
        if (isAdmin) {
          // without admin, game is inactive
          game.state = "closed";
          game.player_1 = null;
        } else {
          if (game.state !== "closed") game.state = "open";
          game.player_2 = null;
        }
        game.emit("game-state", game.data.state);
      });

      /** Return data from requested "file" */
      const getDataFromFile = (file) => {
        switch (file) {
          case 'silos.json':
            return { player_1: game.data["silos-player_1"], player_2: game.data["silos-player_2"] };
          case "defence_posts.json":
            return { player_1: game.data["defence_posts-player_1"], player_2: game.data["defence_posts-player_1"] };
          case "msg_history.txt":
            return game.data.msg_history;
          case "ru_cities.json":
            return game.data.ru_cities;
          case "us_cities.json":
            return game.data.us_cities;
          case "vars.json":
            return game.data.vars;
          case "events.json":
            return game.data.events;
          default:
            return undefined;
        }
      };
      /** Update a "file" with data */
      const updateFileData = (file, data) => {
        switch (file) {
          case 'silos.json':
            game.data["silos-" + me] = data;
            return true;
          case "defence_posts.json":
            game.data["defence_posts-" + me] = data;
            return true;
          case "msg_history.txt":
            game.data.msg_history = data;
            return true;
          case "ru_cities.json":
            game.data.ru_cities = data;
            return true;
          case "us_cities.json":
            game.data.us_cities = data;
            return true;
          case "vars.json":
            game.data.vars = data;
            return true;
          case "events.json":
            game.data.events = data;
            return true;
          default:
            return undefined;
        }
      };

      const addUpdate = (file, execCodes = []) => {
        const fileData = getDataFromFile(file);
        game.emit("handle-update", { file, fileData, execCodes });
      };

      // Add update
      this.socket.on("add-update", ({ file, execCodes }) => {
        addUpdate(file, execCodes);
        game.emit("game-state", game.data.state);
      });

      // Save message history
      this.socket.on("save-msgs", ({ text, sync }) => {
        game.data.msg_history = text;
        if (sync) addUpdate("msg_history.txt", [4]);
      });

      // Pause game (lost focus)
      this.socket.on("pause", value => {
        game.data.ispaused[isAdmin ? "player_1" : "player_2"] = value;
        game.emit("pause", game.data.ispaused);
        if (!(game.data.ispaused.player_1 || game.data.ispaused.player_2)) {
          addUpdate(file);
          game.emit("game-state", game.data.state);
        }
      });

      // Update "file" data
      this.socket.on("update-data", ({ file, data }) => {
        updateFileData(file, data);
      });

      this.socket.on("set-personal-data", params => {
        if (params.money !== undefined) game.data.vars[me].money = params.money;
        if (params.income !== undefined) game.data.vars[me].income = params.income;
      });

      this.socket.on("game-state", () => {
        game.emit("game-state", game.data.state);
      });

      return {
        id: game.id,
        isAdmin, // Player1 is admin of the game
        isPaused: game.data.ispaused.player_1 || game.data.ispaused.player_2,
        pausedPlayer: game.data.ispaused.player_1 ? "player_1" : game.data.ispaused.player_2 ? "player_2" : null,
        data: {
          state: game.state,
          lastState: null,
          vars: game.data.vars,
          silos: { player_1: game.data["silos-player_1"], player_2: game.data["silos-player_2"] },
          defence_posts: { player_1: game.data["defence_posts-player_1"], player_2: game.data["defence_posts-player_2"] },
          countries: game.data.countries,
          events: game.data.events,
          me: game.data.vars[isAdmin ? "player_1" : "player_2"],
          enemy: game.data.vars[isAdmin ? "player_2" : "player_1"],
          cities: {
            RU: game.data.ru_cities,
            US: game.data.us_cities,
          },
        },
        me: isAdmin ? "player_1" : "player_2",
        enemy: isAdmin ? "player_2" : "player_1",
        message_old: game.data.msg_history,
      };
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