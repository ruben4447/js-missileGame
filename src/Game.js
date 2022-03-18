const path = require("path");
const utils = require("./utils.js");

class Game {
    constructor(id) {
        this.id = id;
        this.data = undefined;
    }

    /** Get path to game file */
    get fpath() { return path.join("data", `${this.id}.json`); }

    /** Read data from game file */
    async readData() {
        const text = await utils.fread(this.fpath);
        return (this.data = JSON.parse(text));
    }

    /** Write data this.data to game file */
    async writeData() {
        const text = JSON.stringify(this.data);
        await utils.fwrite(this.fpath, text);
        return true;
    }

    /** Create and Game object with game data !NOTE! data is not saved to file. Call Game.writeData() to save. */
    static async createGameObject(name, password, player1_IsUS) {
        const data = JSON.parse(await utils.fread("data/_template.json"));
        const GAMEID = utils.createID(), GAMECODE = Math.floor(Math.random() * 1000);

        // Setup vars
        data.vars.general.id = GAMEID;
		data.vars.general.name = name;
		data.vars.general.password = password;
		data.vars.general.join_code = GAMECODE;

        const US = player1_IsUS ? 'player_1' : 'player_2', RU = player1_IsUS ? 'player_2' : 'player_1';

        data.vars[US].region = 'US';
        data.vars[RU].region = 'RU';
        data.vars[US].colour = '#09F';
        data.vars[US].ally_colour = '#90CDF5';
        data.vars[US].weapon_colour = "#44E";
        data.vars[RU].colour = '#DB5454';
        data.vars[RU].ally_colour = '#D77';
        data.vars[RU].weapon_colour = '#E22';
        data.us_cities.owner = US;
        data.ru_cities.owner = RU;

        // Setup US cities
        for (let city in data.us_cities) {
            if (typeof data.us_cities[city] === 'object') {
                data.vars[US].population += data.us_cities[city].population;
                data.us_cities[city].population_100p += data.us_cities[city].population;
            }
        }
        data.vars[US].population_100p = data.vars[US].population;

        // Setup RU cities
        for (let city in data.ru_cities) {
            if (typeof data.ru_cities[city] === 'object') {
                data.vars[RU].population += data.ru_cities[city].population;
                data.ru_cities[city].population_100p += data.ru_cities[city].population;
            }
        }
        data.vars[RU].population_100p = data.vars[RU].population;

        return data;
    }
}

module.exports = Game;