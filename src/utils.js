const fs = require('fs');
const uuid = require('uuid');

async function fread(path) {
    return new Promise((res) => fs.readFile(path, "utf-8", (e, d) => res(d)));
}

async function fwrite(path, data) {
    return new Promise((res) => fs.writeFile(path, data, "utf-8", e => res()));
}

function createID() {
    return uuid.v4();
}

function createRegex() {
    return new RegExp("^[A-Za-z0-9\\-_\\$@]*$", "g");
}

module.exports = {
    fread, fwrite,
    createID,
    createRegex,
};