class Time {
	// Get time input
	static GenInput() {
		let now = new Date();
		let html = '';

		// hours
		html += '<select id="time_select_h">';
		for (let h = 0; h <= 23; h += 1)
			if (h >= now.getHours())
				html += '<option value="' + (h.toString().length == 1 ? '0' + h : h) + '">' + (h.toString().length == 1 ? '0' + h : h) + '</option>';
		html += '</select> <b>:</b>&nbsp;';

		// minutes
		html += '<select id="time_select_m">';
		for (let h = 0; h < 60; h += 1)
			html += '<option ' + (h == now.getMinutes() ? 'selected ' : '') + 'value="' + (h.toString().length == 1 ? '0' + h : h) + '">' + (h.toString().length == 1 ? '0' + h : h) + '</option>';
		html += '</select> <b>:</b>&nbsp;';

		// seconds
		html += '<select id="time_select_s">';
		for (let h = 0; h < 60; h += 1)
			html += '<option ' + (h == now.getSeconds() ? 'selected ' : '') + 'value="' + (h.toString().length == 1 ? '0' + h : h) + '">' + (h.toString().length == 1 ? '0' + h : h) + '</option>';
		html += '</select>';

		return html;
	};

	// Get the time from time input
	static FromInput() {
		return (document.getElementById('time_select_h').value.toString() + document.getElementById('time_select_m').value.toString() + document.getElementById('time_select_s').value.toString());
	};

	// Get time now
	static Now(formatted = false) {
		let now = new Date();
		let time = '';

		let h = now.getHours();
		time += (h.toString().length == 1 ? '0' + h : h).toString();
		if (formatted) time += ':';

		let m = now.getMinutes();
		time += (m.toString().length == 1 ? '0' + m : m).toString();
		if (formatted) time += ':';

		let s = now.getSeconds();
		time += (s.toString().length == 1 ? '0' + s : s).toString();

		return time;
	};

	// Foat time, give h, m, s, into standard Time() time
	static Format(h, m, s) {
		h = h.toString();
		m = m.toString();
		s = s.toString()
		if (h.length == 1) h = '0' + h;
		if (m.length == 1) m = '0' + m;
		if (s.length == 1) s = '0' + s;
		return h + m + s;
	};

	// Add some time on to time
	static AddBits(time, secs = 0, mins = 0, hours = 0) {
		if (time == 'now') time = Time.Now();
		if (secs == 0 && mins == 0 && hours == 0) return time;
		time = time.toString();
		let h = parseInt(time.slice(0, 2));
		let m = parseInt(time.slice(2, 4));
		let s = parseInt(time.slice(4, 6));

		while (s + secs >= 60)
			m += 1,
				secs -= 60;
		s += secs;
		while (m >= 60)
			m -= 60,
				h += 1;
		while (m + mins >= 60)
			mins -= 60,
				h += 1;
		m += mins;
		h += hours;

		if (h > 23 && m >= 59 && s >= 59) throw "TimeError: time cannot be > 23:59:59";
		return Time.Format(h, m, s);
	};

	// Subtract times (t1 - t2)
	static Subtract(t1, t2) {
		if (t1 == 'now') t1 = Time.Now();
		if (t2 == 'now') t2 = Time.Now();
		if (parseInt(t2) > parseInt(t1)) return '000000';
		if (t1 == t2) return t1;
		t1 = t1.toString(), t2 = t2.toString();
		let h1 = parseInt(t1.slice(0, 2));
		let m1 = parseInt(t1.slice(2, 4));
		let s1 = parseInt(t1.slice(4, 6));

		let h2 = parseInt(t2.slice(0, 2));
		let m2 = parseInt(t2.slice(2, 4));
		let s2 = parseInt(t2.slice(4, 6));

		let h = h1 - h2;
		let m = m1 - m2;
		let s = s1 - s2;

		while (s < 0)
			s += 60,
				m -= 1;
		while (m < 0)
			m -= 60,
				h -= 1;

		return Time.Format(h, m, s);
	};

	// Subtract time (t1 - secs)
	static SubtractSecs(time, secs = 0) {
		if (time == 'now') t1 = Time.Now();
		if (secs == 0) return time;

		let h = parseInt(time.slice(0, 2));
		let m = parseInt(time.slice(2, 4));
		let s = parseInt(time.slice(4, 6));

		while (s - secs < 0)
			m -= 1,
				secs -= 60;
		s -= secs;

		return Time.Format(h, m, s);
	};

	// Displays time from format to readable
	static Display(time) {
		return time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4, 6);
	};

	// Generates a countdown clock. Froma time, to another time, show a countdown
	static CountdownClock(selector, start, until, alert_at = null, done_text = 'Done', for_silo = null, for_event = null) {
		if (start == 'now') start = Time.Now();
		if (parseInt(start) <= parseInt(until)) {
			//console.log("CLOCK NOT STARTED")
			for (let el of document.querySelectorAll(selector)) el.innerText = done_text;
			return 0;
		} else {
			//console.log('Clock Start')
			let time = start;
			for (let clock of document.querySelectorAll(selector)) clock.innerText = Time.Display(time);

			// Interval for clock
			let interval = setInterval(function () {
				time = Time.__CountdownClock(interval, selector, time, until, alert_at, done_text, for_silo, for_event);
			}, 1000);
			return interval;
		}
	};

	static __CountdownClock(interval, selector, time, until, alert_at, done_text, for_silo, for_event) {
		time = Time.SubtractSecs(time, 1);  // Decrement time
		for (let clock of document.querySelectorAll(selector)) clock.innerText = Time.Display(time);
		//console.log("CLOCK CYCLE @ " + time)

		// If alert. (only do once; interval every second, so we won't miss it)
		if (alert_at != null && parseInt(time) == parseInt(alert_at))
			for (let clock of document.querySelectorAll(selector))
				clock.classList.add('alert');

		// If past countdown...
		if (parseInt(time) <= parseInt(until)) {
			for (let clock of document.querySelectorAll(selector)) {
				clock.innerText = done_text;
				clock.classList.replace('alert', 'done');
			}
			clearInterval(interval);
		}

		// If event is marked as finished (from GameEvent)
		if (for_silo != null && for_event != null) {
			if (window.data.popup_silo[for_silo][for_event] == null) clearInterval(interval);
		}
		return time;
	};
}

// POPULATED IN _init_
const Constants = {};

class Sounds {
	// Stores paths of sounds
	static Paths = class {
		static EXPLOSION_SRM = 'sounds/explosion_srm.ogg';				// Short Range Missile explosion
		static EXPLOSION_LRM = 'sounds/explosion_lrm.ogg';				// Long Range MIssile explosion
		static EXPLOSION_DM = 'sounds/explosion_dm.ogg';				// Defence Missile explosion
		static EXPLODE_WATER = 'sounds/explode_water.ogg';				// Explosion in water
		static TSAR = 'sounds/tsar.ogg';
		static COLLAPSE = 'sounds/collapse.ogg';						// Silo destroyed sound
		static CITY_DEATH = 'sounds/death_city.ogg';					// City destroyed sound
		static BEEP = 'sounds/beep.ogg';
		static BUZZER = 'sounds/buzzer.ogg';
		static LAUNCH = 'sounds/launch.ogg';
	};

	// Stores buffers of each sound (loaded in Action.CreateSoundBuffers)
	static Buffers = class { };

	// Initiate
	static Init() {
		Sounds.Context = new AudioContext();
		Sounds.GainNode = Sounds.Context.createGain();
		Sounds.GainNode.connect(Sounds.Context.destination);
		return 0;
	};

	// Create a sound buffer for a given path (and name)
	static CreateSoundBuffer(path, name, play = false) {
		if (Sounds.Buffers[name] != null) return 0;

		let http = new XMLHttpRequest();
		http.onload = function () {
			Sounds.Context.decodeAudioData(http.response, function (binary) {
				Sounds.Buffers[name] = binary;
				console.log("%cCreate Buffer for '" + name + "' path '" + Sounds.Paths[name] + "'", "color:grey;font-style:italic;");
				if (play) Sounds.Play(name);
			}, function (error) {
				console.error('SoundError: could not fetch buffer data for \'' + path + '\'');
			});
		};
		http.open('GET', path, true);
		http.responseType = 'arraybuffer';
		http.send();
	};

	// Play a sound from a buffer
	static Play(name) {
		name = name.toUpperCase();

		// If nuffer does not exit, create it
		if (Sounds.Buffers[name] == null) return Sounds.CreateSoundBuffer(Sounds.Paths[name], name, true);

		let source = Sounds.Context.createBufferSource();
		source.buffer = Sounds.Buffers[name];
		source.connect(Sounds.GainNode);
		source.onended = function () {
			if (this.stop) this.stop();
			if (this.disconnect) this.disconnect();
		};
		source.start(0);
		return 0;
	};
}

class Active {
	static CountryViewing = null;	// Which country is being viewed in popup_control_board
	static SiloViewing = null;		// Which silo is being viewed in popup_control_board
	static DefencePostViewing = null; // Which defence post is being viewed in popup_control_board
	static CityViewing = null;		// Which city is being viewed in popup_control_board
	static PopupViewing = null;		// Stores what is being viewed in popup_control_board
	static LaunchingFrom = null;	// When a weapon is being launched, which silo is it from?
	static LaunchingType = null;	// What weapon is being launched?
	static LaunchingCount = null;	// How many weapons are being launched? (same type; same launch sequence)
	static LaunchingFromDefence = false;	// Has the launch been initiated from the 'launch defence missile' button on the main panel?
	static TargetEvent = null;			// Stores the evtn of a target e.g. for weapon launching
	static SiloCooldown = [];		// Each silo has a cooldown after it is used
	static HadFocus = null;			// DId the page have focus last update check (Update.CheckFocus) ?
}

// Handles calculations, such as income, weapon speed etc...
class Calculations {
	// Adjust coordinates so relative over SVG element
	static AdjustCoords(x, y) {
		return [(x - Constants.TARGET_OFFSET_X), (y - Constants.TARGET_OFFSET_Y)];
	};

	// Get the cost of allying a country
	static GetAllyCost(cid) {
		let info = window.countries[cid];
		let cost = info.gdp * window.gamevars.ally_multiplier;
		return Math.round(cost)
	};

	// Calculate the income from your mainland
	static GetHomeIncome() {
		let incomePP = window.gamevars.region_generation / window.data.me.population_100p;
		let income = incomePP * window.data.me.population;
		return Math.round(income);
	};

	// Calculate the income for an ally
	static GetAllyIncome(cid) {
		let health = window.data.countries[cid]['health'];
		let income = window.countries[cid]['gdp'] * (health / 100);
		return Math.round(income);
	};

	// Get income of a city
	static GetCityIncome(region, name) {
		region = region.toUpperCase();
		let owner = window.data.vars[window.getOwner(region)];
		let city = window.data.cities[region][name];
		let incomePP = window.gamevars.region_generation / owner.population_100p;
		let income = incomePP * city.population;
		return Math.round(income);
	};

	// Find speed of window.weapons
	// svg#map.width / weapon.cross_time
	static WeaponSpeeds() {
		for (let weapon in window.weapons)
			window.weapons[weapon].speed = (Constants.TARGET_W / window.weapons[weapon].cross_time);
		for (let item in window.defences)
			window.defences[item].speed = (Constants.TARGET_W / window.defences[item].cross_time);
		return 0;
	};
}
