/*		Base Game Variables		*/
window.gamevars = {
	"colours": {
		"city": "#000",
		"defence": "#15FF00"
	},
	"region_generation": 25000,
	"country_colour": "#666666",  // Default (i.e. not an ally/mainland)
	"ally_multiplier": 1000,		// What to multiply ally GDP by to work out the cost
	"update_state_time": 1000,
	"update_income_time": 5000,
	"event_action_time": 1000,		// How often the Action() method of Events.Event is called
	"event_wait_time": 1000,		// How often the Wait() method of Events.Event is called
	"event_weapon_action_time": 50,		// How often the Action() method of Events.Event is called FOR WEAPONS
	"pulse_explosion": 1500,
	"chance_lose_weapon": 10,				// When a silo is hit, chance (1/n) that each missile will be lost
	"defence_explode_r": 3				// Radius of explosions that defence weaponry cause when they destroy enemy events
};

/*		Prices of Various Game Things		*/
window.prices = {
	silo: 2250000,
	defence_post: 1000000,
	short_range_missile: 200000,
	long_range_missile: 300000,
	tsar: 1000000000,
	defence_missile: 120000,
	adv_defence_missile: 250000,
	empty: 5000,
	mirv: 400000,
	test: 0,
};

window.types = {
	empty: 'weapon',
	long_range_missile: 'weapon',
	short_range_missile: 'weapon',
	tsar: 'weapon',
	defence_missile: 'defence',
	adv_defence_missile: 'defence',
	mirv: 'weapon',
	mirv_child: 'weapon',

	test: 'weapon'
};

/*		Game Weapon info (things in silos)		*/
// Map width: 1170 px
// Map height: 550 px
window.weapons = {
	test: {
		radius: 0,
		cross_time: 40,
		type: "weapon",
		damage: 0,
		impact: 0,
		cooldown: 0,
		range: 1000,
		purchasable: false
	},
	empty: {
		radius: 0,
		cross_time: 35,
		type: 'weapon',
		damage: 0,
		silo_damage: 0,
		impact: 0,
		cooldown: 6000,
		range: 270
	},
	long_range_missile: {
		radius: 8,
		cross_time: 40,
		damage: 13,
		silo_damage: 15,
		impact: 600000,
		type: 'weapon',
		cooldown: 20000,
		range: 700
	},
	short_range_missile: {
		radius: 5,
		cross_time: 50,
		damage: 8,
		silo_damage: 25,
		impact: 1000000,
		type: 'weapon',
		cooldown: 12000,
		range: 350
	},
	mirv: {
		cross_time: 52,
		type: 'weapon',
		cooldown: 31000,
		range: 700,
		split_percent: 70,
		children_no: 2
	},
	mirv_child: {
		purchasable: false,
		radius: 3,
		cross_time: 38,
		damage: 6,
		silo_damage: 5,
		impact: 200000,
		type: 'weapon',
		cooldown: 0,
		range: 1170			// Basically infinite, as their range is confined by the MIRV parent
	},
	tsar: {
		radius: 70,
		cross_time: 60,
		damage: 100,
		silo_damage: 100,
		impact: 10000000,
		type: 'weapon',
		cooldown: 30000,
		range: 600
	}
};

/*			Defence stuff (things in defence posts)		*/
window.defences = {
	defence_missile: {
		influence_radius: 10,
		radius: 10,
		cross_time: 33,
		type: 'defence',
		range: 160
	},
	adv_defence_missile: {
		influence_radius: 10,
		radius: 10,
		cross_time: 35,
		type: 'defence',
		range: 100
	}
};

/*		Descroption of Each Weapon Property		*/
window.weapon_descriptions = {
	radius: "max radius of explosion created",
	influence_radius: "radius wherein missiles action takes effect",
	cross_time: "seconds taken to cross the map",
	speed: "pixels travelled per second",	// calculated in calculations.js
	damage: "% health removed from impacted country (NOT home regions)",
	silo_damage: "% health removed from silo if hit",
	impact: "min number of people that are obliterated due to missile (city)",
	type: "the 'species' or nature of the weapon",
	range: "how far the missile can travel"
};

/* cities in a region, with their coords on the map (used in drawing)	*/
window.cities = {
	"ru": {
		"moscow": [672, 116],
		"saint_petersburg": [642, 106],
		"novosibirsk": [800, 124],
		"nyurba": [897, 100],
		"chatanga": [810, 62],
		"samara": [710, 124],
		"omsk": [772, 120],
		"bilibino": [987, 82],
		"chelyabinsk": [743, 118],
		"rostov-on-don": [682, 151]
	},
	"us": {
		"new_york_city": [353, 162],
		"miles_city": [252, 157],
		"chicago": [293, 173],
		"houston": [255, 216],
		"philadelphia": [337, 172],
		"phoenix": [207, 195],
		"denver": [231, 173],
		"san_diego": [189, 205],
		"dallas": [260, 198],
		"san_jose": [185, 179]
	}
};
