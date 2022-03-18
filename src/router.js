const express = require('express');
const utils = require('./utils.js');
const auth = require('./auth.js');

const router = express.Router();

router.post("/login", async (req, res, next) => {
    const users = JSON.parse(await utils.fread("data/_users.js"));
    let ok = false;
    console.log(`[LOGIN]  Request: username=${req.body.username}; password=${req.body.password}`);
    if (req.body.username in users) {
        if (req.body.password === users[req.body.username]) {
            ok = true;
            const token = auth.create(req.body.username);
            console.log(`[LOGIN]  Success: ${req.body.username}; token=${token}`);
            res.redirect("/index.html?" + token);
        }
    }
    if (!ok) {
        res.redirect('/index.html?incorrect');
    }
});

module.exports = router;