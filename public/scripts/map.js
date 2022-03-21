class Map {
	// Get state attribute
	static GetState() {
		return Constants.TARGET.getAttribute('state');
	}

	// Set state attribute
	static SetState(state) {
		Constants.TARGET.setAttribute('state', state);
		return 0;
	}

	// Draw a city to the map
	static DrawCity(region, name) {
		let coords = window.cities[region];
		if (coords == null) throw "Error: cannot locate region '" + region + "' (in func draw_city)";
		coords = coords[name];
		if (coords == null) throw "Error: cannot locate city '" + name + "' in region '" + region + "' (in func draw_city)";

		let element = create_svg_element('circle', {
			cx: coords[0],
			cy: coords[1],
			class: 'city',
			'data-region': region.toUpperCase(),
			'data-name': name,
			id: region + '-city-' + name
		});

		Constants.TARGET.appendChild(element);

		return 1;
	}

	// Draw every city to the map (calls Cities.DrawCity)
	static DrawCities() {
		for (let region in window.cities)
			for (let city in window.cities[region])
				if (window.data.cities[region][city].population > 0) Map.DrawCity(region, city);
		return 1;
	}

	// Remove cities
	static EraseCities() {
		let elements = Constants.TARGET.querySelectorAll('.city');
		for (let el of elements)
			Constants.TARGET.removeChild(el);
		return 0;
	}

	// Update cities on map
	static UpdateCities() {
		Map.EraseCities();
		Map.DrawCities();
		CityEvents.AddListeners();
		return 0;
	}

	// Get HTML Info card for a city when hovered over
	static CityHtml(region, name) {
		let city;
		try {
			city = window.data.cities[region][name];
		} catch (e) {
			throw 'Error: cannot locate city "' + name + '" in region "' + region + '" (Map.CityHtml)';
		}

		let html = '<table id="map-city-info" data-region="' + region + '" data-name="' + name + '">';
		html += '<tr><th>Name: </th><td><img src="' + Map.GetFlagURL(region) + '" title="' + region + '" class="flag_ref" /> ' + window.display(name) + '</td></tr>';
		let pop = Math.round((city.population / city.population_100p) * 100);
		html += '<tr><th>Pop.: </th><td><meter min="0" low="30" high="75" optimum="90" max="100" value="' + pop + '" /></tr></table>';

		return html;
	}

	// Draw silos on to the map
	static DrawSilos() {
		let silos = window.data.silos[window.me];

		let i = 0;
		for (let silo of silos) {
			let el = create_svg_element('rect', {
				x: silo.x - Constants.SILO_W / 2,
				y: silo.y + Constants.SILO_H / 2,
				width: Constants.SILO_W,
				height: Constants.SILO_H,
				class: 'silo',
				id: window.me + '-silo-' + i,
				"data-id": i,
				'data-region': silo.country
			});
			Constants.TARGET.appendChild(el);
			i += 1;
		}
	}

	// Remove all silos from the map
	static EraseSilos() {
		let elements = Constants.TARGET.querySelectorAll('.silo');
		for (let el of elements)
			Constants.TARGET.removeChild(el);
		return 0;
	}

	static UpdateSilos() {
		Map.EraseSilos();
		Map.DrawSilos();
		SiloEvents.AddListeners();
		return 0;
	}

	// Silo state has changed
	static SilosChanged() {
		Map.UpdateSilos();
		ControlBoard.SiloListOverview();
		return 0;
	}

	// Get HTML display of a silo
	static SiloHtml(id) {
		let silo;
		try {
			silo = window.data.silos[window.me][id];
		} catch (e) {
			throw 'Error: cannot locate silo number ' + id + ' (Map.SiloHtml)';
		}

		let html = '<table id="map-silo-info" data-id="' + id + '">';
		html += '<tr><th>Location: </th><td><img src="' + Map.GetFlagURL(silo.country) + '" class="flag_ref" /> ' + silo.country + '</td></tr>';
		html += '<tr><th>Health: </th><td><meter min="0" low="30" high="75" optimum="90" max="100" value="' + silo.health + '" /></tr>';

		return html + '</table>';
	}

	// Return all silos which contain a given type (contents)
	static GetSilosWith(...type) {
		let obj = {};
		let i = 0;
		for (let silo of window.data.silos[window.me]) {
			for (let weapon in silo.contents) {
				if (type.indexOf(window.weapons[weapon].type) !== -1) {
					if (obj[i] == null) obj[i] = 0;
					obj[i] += silo.contents[weapon];
				}
			}
			i += 1;
		}
		return obj;
	}

	// Draw defence posts on to the map
	static DrawDefences() {
		let defences = window.data.defence_posts[window.me];

		let i = 0;
		for (let post of defences) {
			let el = create_svg_element('rect', {
				x: post.x - Constants.DEFENCE_W / 2,
				y: post.y + Constants.DEFENCE_H / 2,
				width: Constants.DEFENCE_W,
				height: Constants.DEFENCE_H,
				class: 'defence_post',
				id: window.me + '-defence-' + i,
				"data-id": i,
				'data-region': post.country
			});
			Constants.TARGET.appendChild(el);
			i += 1;
		}
	}

	// Remove all silos from the map
	static EraseDefences() {
		let elements = Constants.TARGET.querySelectorAll('.defence_post');
		for (let el of elements) Constants.TARGET.removeChild(el);
		return 0;
	}

	static UpdateDefences() {
		Map.EraseDefences();
		Map.DrawDefences();
		DefenceEvents.AddListeners();
		return 0;
	}

	// Get HTML display of a defence post
	static DefencePostHtml(id) {
		let post;
		try {
			post = window.data.defence_posts[window.me][id];
		} catch (e) {
			throw 'Error: cannot locate defence post number ' + id + ' (Map.DefencePostHtml)';
		}

		let html = '<table id="map-defence-info" data-id="' + id + '">';
		html += '<tr><th>Location: </th><td><img src="' + Map.GetFlagURL(post.country) + '" class="flag_ref" /> ' + post.country + '</td></tr>';
		html += '<tr><th>Health: </th><td><meter min="0" low="30" high="75" optimum="90" max="100" value="' + post.health + '" /></tr>';

		return html + '</table>';
	}

	// Pulses an element on-screen
	static PulseElement(element, time) {
		Constants.TARGET.appendChild(element);
		setTimeout(function () {
			Constants.TARGET.removeChild(element);
		}, time);
		return 0;
	}

	// Pulse an explosion on the map
	static PulseExplosion(coords, r, klass = 'explosion') {
		let el = create_svg_element('circle', {
			cx: coords[0],
			cy: coords[1],
			r: r,
			class: klass
		});
		Map.PulseElement(el, window.gamevars.pulse_explosion);
		return 0;
	}

	// Colour allied countries
	static ColourAllies() {
		// uncolour all coloured countries EXCEPT mainlands
		for (let elem of document.querySelectorAll('svg .country'))
			if (elem.getAttribute('fill') != window.gamevars.country_colour && elem.getAttribute('data-id') != window.data.vars.player_1.region && elem.getAttribute('data-id') != window.data.vars.player_2.region)
				elem.setAttribute('fill', window.gamevars.country_colour);

		for (let country of window.data.me.allies)
			document.querySelector('svg .country[data-id="' + country + '"]').setAttribute('fill', window.data.me.ally_colour);
		for (let country of window.data.enemy.allies)
			document.querySelector('svg .country[data-id="' + country + '"]').setAttribute('fill', window.data.enemy.ally_colour);
		return 0;
	}

	// Allies have changed; update things
	static AlliesChanged() {
		Map.ColourAllies();
		if (Active.CountryViewing != null) {
			let viewing = Active.CountryViewing;
			ControlBoardEvents.ClosePopup();
			ControlBoard.LoadCountryInfo(viewing);
		}
		return 0;
	}

	// Returns array of all silo indexes wherein the silo is in a certain radius of a point
	static GetSilosInRange(x, y, r, alive = true, player = 'all') {
		if (player == 'all')
			return {
				player_1: Map.GetSilosInRange(x, y, r, alive, 'player_1'),
				player_2: Map.GetSilosInRange(x, y, r, alive, 'player_2')
			};
		else {
			let indexes = [];
			for (let i = 0; i < window.data.silos[player].length; i += 1) {
				let silo = window.data.silos[player][i];
				if ((silo.x >= x - r && silo.x <= x + r) && (silo.y >= y - r && silo.y <= y + r) && ((alive && window.data.silos[player][i].health > 0) || !alive))
					indexes.push(i);
			}
			return indexes;
		}
	}

	// Returns array of all city names wherein the city is in a certain radius of a point
	// Alive - does city need to be 'alive' ??
	static GetCitiesInRange(x, y, r, alive = true, region = 'all') {
		if (region == 'all')
			return {
				RU: Map.GetCitiesInRange(x, y, r, alive, 'RU'),
				US: Map.GetCitiesInRange(x, y, r, alive, 'US')
			};
		else {
			let indexes = [];
			for (let city in window.data.cities[region]) {
				if (city == 'owner') continue;
				let loc = window.cities[region.toLowerCase()][city];
				if ((loc[0] >= x - r && loc[0] <= x + r) && (loc[1] >= y - r && loc[1] <= y + r) && ((alive && window.data.cities[region][city].population > 0) || !alive))
					indexes.push(city);
			}
			return indexes;
		}
	}

	// Returns array of all cevents wherein the events are in a certain radius from a point
	static GetEventsInRange(x, y, r, from_user = 'any') {
		let IDs = [];
		for (let ID in Events.List) {
			let loc = Events.List[ID].coords;
			if ((loc[0] >= x - r && loc[0] <= x + r) && (loc[1] >= y - r && loc[1] <= y + r) && (Events.List[ID].from_user == from_user || from_user == 'any'))
				IDs.push(ID);
		}
		return IDs;
	}

	// Highlight the given country
	static HighlightCountry(code) {
		Constants.TARGET.querySelector('.country[data-id="' + code + '"]').classList.add('highlighted');
		return 0;
	}

	// Remove the highlight from the given country
	static UnHighlightCountry(code) {
		Constants.TARGET.querySelector('.country[data-id="' + code + '"]').classList.remove('highlighted');
		return 0;
	}

	// Highlight the given silo
	static HighlightSilo(id) {
		Constants.TARGET.querySelector('.silo#' + window.me + '-silo-' + id).classList.add('highlighted');
		return 0;
	}

	// Remove the highlight from the given silo
	static UnHighlightSilo(id) {
		Constants.TARGET.querySelector('.silo#' + window.me + '-silo-' + id).classList.remove('highlighted');
		return 0;
	}

	// Provided a country code, return path to the flag image
	static GetFlagURL(code) {
		return 'flags/' + code + '.svg';
	}

	// Get info of provided element
	// Return array(2) {type, country}
	static GetElementInfo(element) {
		if (element != null) {
			if (element.classList.contains('country'))
				return ['land', element.getAttribute('data-id')];
			else if (element.classList.contains('silo') || element.classList.contains('city'))
				return ['land', element.getAttribute('data-region')];
			else
				return ['sea', 'sea'];
		} else
			return [null, null];
	}

	// Check if there is a winner
	static CheckWinner() {
		if (window.data.me.population <= 0)
			Map.Winner(window.enemy);
		else if (window.data.enemy.population <= 0)
			Map.Winner(window.me);
		else
			return 0;
	}

	// There is a winner...
	static Winner(victor) {
		let loser = (victor == 'player_1' ? 'player_2' : 'player_1');

		// Play national anthem (we need to load it in first)
		let anthem = new Audio();
		anthem.src = 'sounds/' + window.data.vars[victor].region.toLowerCase() + '_national_anthem.ogg';
		anthem.play();

		// Update vars.json
		window.data.state = 'finished';
		Map.SetState('finished');
		window.data.vars.winner = victor;
		if (victor == window.me)
			Update.File(Constants.AUTH, 'vars.json', window.data.vars);

		// Colour all countries as victor's allies
		for (let el of Constants.TARGET.querySelectorAll('.country')) {
			let id = el.getAttribute('data-id');

			// Clone element (remove event listeners)
			let newel = el.cloneNode(true);
			el.parentNode.replaceChild(newel, el);

			// Ignore victor's home region
			if (id == window.data.vars[victor].region) { }
			// If loser's home region, colour darker
			else if (id == window.data.vars[loser].region)
				newel.setAttribute('fill', window.data.vars[victor].colour);
			else
				newel.setAttribute('fill', window.data.vars[victor].ally_colour);
		}

		// Remove some elements
		removeElement('#control_board_content');
		removeElement('#top_info');
		removeElement('#btn_cancel_all_actions');

		// If admin, they must delete game, not leave
		if (window.isAdmin) removeElement('#btn_leave_game');

		// Adjust heights/sizes of things to complement element removals
		document.getElementById('control_board').style.height = Constants.TARGET_H;
		document.getElementById('control_board_flag').classList.remove('flag_title');

		// Remove events (no need to save)
		window.onbeforeunload = undefined;
		if (window.isAdmin) window.onerror = undefined;

		// Message
		document.getElementById('control_board').innerHTML += '<h3>' + getCountryName(window.data.vars[victor].region) + ' is victorious!</h3>';
		if (window.data.vars[victor].allies.length > 0) {
			document.getElementById('control_board').innerHTML += '<br><br><b>With thanks to its allies...</b><br>';
			for (let ally of window.data.vars[victor].allies)
				document.getElementById('control_board').innerHTML += '<img src="' + Map.GetFlagURL(ally) + '" class="flag_med" /> &nbsp; ' + getCountryName(ally) + '<br>';
		}
		document.getElementById('control_board').innerHTML += '<br><br>';
		document.getElementById('control_board').innerHTML += (victor == window.me ? 'Well Done Sir.' : 'Better Luck Next Time.');

		// Only execute if we are the loser...
		if (loser == window.me) {
			// Remove all silos
			Map.EraseSilos();
			// Change flag in control_board to victor's
			document.getElementById('control_board_flag').src = Map.GetFlagURL(window.data.vars[victor].region);
		}

		return 0;
	}

	// Get distance between two points
	static DistancePoints(p1, p2) {
		let dx = Number(p1[0]) - Number(p2[0]);
		let dy = Number(p1[1]) - Number(p2[1]);
		let d = Math.sqrt((dx * dx) + (dy * dy));
		return d;
	}

	// Returns array of defence posts with a missile in
	static GetDefencePostsWith(...missiles) {
		if (window.data.defence_posts[window.me].length < 1) return [];
		let posts = [];

		for (let i = 0; i < window.data.defence_posts[window.me].length; i += 1)
			for (let missile in window.data.defence_posts[window.me][i].contents)
				if (missiles.indexOf(missile) !== -1) posts.push(i);
		return posts;
	}

	// Gets closest defence point to a set of coordinates
	static GetDefencePostClosest(coords) {
		if (window.data.defence_posts[window.me].length < 1) return 0;

		let closest = 0;
		let dist = Map.DistancePoints(coords, [window.data.defence_posts[window.me][closest].x, window.data.defence_posts[window.me][closest].y]);

		for (let i = 1; i < window.data.defence_posts[window.me].length; i += 1) {
			let current = window.data.defence_posts[window.me][i];
			let d = Map.DistancePoints(coords, [current.x, current.y]);
			//console.log(i + ')  ' + dump(d) + '\t\t\t vs ' + dump(dist) + ' (' + closest + ')');
			if (d < dist) {
				dist = d;
				closest = i;
			}
		}

		return closest;
	}

	// Remove visual circles which represent range of missiles from a given point
	static RemoveRadiiMarkers() {
		let els = Constants.TARGET.getElementsByClassName('weapon_radius');
		while (els[0]) els[0].remove();
		return 0;
	}
}
