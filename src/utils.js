const fs = require('fs');
const uuid = require('uuid');

/** Read data from a file */
async function fread(path) {
  return new Promise((res) => fs.readFile(path, "utf-8", (e, d) => res(d)));
}

/** Write data to a file */
async function fwrite(path, data) {
  return new Promise((res) => fs.writeFile(path, data, "utf-8", e => res()));
}

/** Delete a file */
async function fdelete(path) {
  return new Promise(res => fs.unlink(path, err => res(err === undefined)));
}

/** Return new UUID */
function createID() {
  return uuid.v4();
}

/** Return new RegExp object for valid names */
function createRegex() {
  return new RegExp("^[A-Za-z0-9\\-_\\$@]*$", "g");
}

/** Get HTML state entity from game state string */
function getStateSymbol(state) {
  switch (state) {
    case 'closed':
      return '&#128272;';
    case 'open':
      return "&#128275;";
    case 'full':
      return '&#128683;';
    case 'locked':
      return '&#128274;';
    default:
      return undefined;
  }
}

/**
 * Handle termination actions of a server
 * Taken from https://blog.heroku.com/best-practices-nodejs-errors (c) JULIÁN DUQUE, DECEMBER 17, 2019
 */
function handleTermination(server, options) {
  if (options.coredump === undefined) options.coredump = false;
  if (options.timeout === undefined) options.timeout = 500;
  if (options.log === undefined) options.log = false;

  // Exit function
  const exit = (code) => {
    options.coredump ? process.abort() : process.exit(code);
  };

  return (code, reason) => async (err) => {
    if (options.log) console.error(`[ERROR] code ${code}: ${reason}`);
    if (err && err instanceof Error) {
      console.log(err.message, err.stack);
    }
    if (options.fn) await options.fn(code);

    // Attempt a graceful shutdown
    server.close(exit);
    setTimeout(exit, options.timeout).unref();
  };
}

module.exports = {
  fread, fwrite, fdelete,
  createID,
  createRegex,
  getStateSymbol,
  handleTermination,
};