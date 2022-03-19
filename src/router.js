const express = require('express');
const utils = require('./utils.js');
const auth = require('./auth.js');
const Game = require('./Game.js');

const router = express.Router();

router.post("/login", async (req, res, next) => {
  const users = JSON.parse(await utils.fread("data/_users.json"));
  let ok = false;
  console.log(`[LOGIN]  Request: username=${req.body.username}; password=${req.body.password}`);
  if (req.body.username in users) {
    if (req.body.password === users[req.body.username]) {
      ok = true;
      const token = auth.create(req.body.username);
      res.redirect("/menu.html?" + token);
    }
  }
  if (!ok) {
    res.redirect('/index.html?incorrect');
  }
});

router.get("/logout/:token", (req, res, next) => {
  if (auth.exists(req.params.token)) {
    console.log(`[LOGOUT] token=${req.params.token}; username=${auth.get(req.params.token)}`);
    auth.remove(req.params.token);
    res.redirect("/index.html?logout");
  } else {
    res.redirect("/index.html?unauth");
  }
});

// DELETE GAME
router.get("/delete-game/:token/:gameId", async (req, res, next) => {
  let ok = false;
  if (auth.exists(req.params.token)) {
    const game = Game.getFromID(req.params.gameId);
    if (game) {
      ok = true;
      console.log(`[DELETE] Delete game id=${game.id}; name=${game.name}`);
      ok = await game.deleteData();
      if (ok) {
        Game.all.delete(game.name);
        res.redirect("/menu.html?" + req.params.token);
      }
    }

  }

  if (!ok) {
    res.redirect("/index.html?unauth");
  }
});

// DELETE ACCOUNT
router.get("/delete/:token", async (req, res, next) => {
  if (auth.exists(req.params.token)) {
    let username = auth.get(req.params.token);
    console.log(`[DELETE] Delete account token=${req.params.token}; username=${username}`);
    auth.remove(username);
    const users = JSON.parse(await utils.fread("data/_users.json"));
    delete users[username];
    await utils.fwrite("data/_users.json", JSON.stringify(users));
    res.redirect("/index.html?deleted&du=" + username);
  } else {
    res.redirect("/index.html?unauth");
  }
});

module.exports = router;