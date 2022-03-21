// Stores current states for Action.Current
const ActionState = {
	None: 0,
	BuildSilo: 1,
	BuildDefence: 2,
	PickTarget: 3,
};

class Action {
	static Current = ActionState.None; // Is there an action running?

	// Provides HTML for the 'cancel action' button
	static CancelActionBtn(wrapper_id, text = 'Cancel Action') {
		return '<button class="cancel_action btn_red" onclick="Action.Cancel(\'' + wrapper_id + '\')">' + text + '</button>';
	}

	// Cancel the current action
	static Cancel(btn_wrapper_id = false) {
		if (btn_wrapper_id !== false) document.getElementById(btn_wrapper_id).innerHTML = '';
		Action.Current = ActionState.None;
		Map.SetState('idle');
		if (Active.LaunchingType != null) Map.RemoveRadiiMarkers();
		if (Active.LaunchingFromDefence) {
			document.getElementById('defence_launch_type').removeAttribute('disabled');
			Active.LaunchingFromDefence = false;
		}
		return 0;
	}

	// Master - Cancel ALL actions
	static CancelAll() {
		for (let elem of document.querySelectorAll('.cancel_action'))
			elem.remove();
		Action.Current = ActionState.None;
		if (Active.LaunchingType != null) Map.RemoveRadiiMarkers();
		Map.SetState('idle');
		return 0;
	}

	// Build silo button is pressed
	static BuildSilo(coords = false, cid = undefined) {
		// (1) Check if user has enough money
		if (window.data.me.money < window.prices.silo) {
			window.alert('You do not have enogh money to build a new silo!\nYou need: ' + window.commas(window.prices.silo) + '\nYou have: ' + window.commas(window.data.me.money));
			document.getElementById('cancel_build_silo').innerHTML = '';
			return 0;
		}

		// If coords is false (i.e. not supplied) set Action.Current to build_silo. Then, when used clicks on a country, we go back here WITH coords supplied from event
		if (coords == false) {
			Action.Current = ActionState.BuildSilo;
			Map.SetState('action');
		} else {
			// Coordinates provided; build silo
			// (1) Remove money
			window.data.me.money -= window.prices.silo;

			// (2) Add silo object to window.data.silos.<me> and update file
			window.data.silos[window.me].push({
				x: coords[0].toFixed(2),
				y: coords[1].toFixed(2),
				health: 100,
				country: cid,
				contents: {}
			});

			Map.UpdateSilos();
			ControlBoard.Info();
			Update.File(Constants.AUTH, 'silos.json', window.data.silos); Update.Add('silos.json');
			Update.File(Constants.AUTH, 'vars.json', window.data.vars);
			Update.PopupSiloData();
			ControlBoard.SiloListOverview();
		}
		return 0;
	}

	// 'Delete' a silo
	static DecomissionSilo(num) {
		if (window.confirm('Are you sure you want to decomission this silo?\nIt cost ' + window.commas(window.prices.silo) + ' but you won\'t get any money back.\nYou will also lose all weapons stored inside the silo!') !== true) return 0;
		window.data.silos[window.me].splice(num, 1);
		Sounds.play('collapse');

		// If decomissioned, player must have had the popup_control_board open; close it
		ControlBoardEvents.ClosePopup();
		ControlBoard.SiloListOverview();

		Map.UpdateSilos();
		Update.File(Constants.AUTH, 'silos.json', window.data.silos); Update.Add('silos.json');
		Update.File(Constants.AUTH, 'vars.json', window.data.vars);

		return 0;
	}

	// Build a defence post (DefenceEvents.ClickBuildDefence)
	static BuildDefence(coords = false, cid = undefined) {
		// (1) Check if user has enough money
		if (window.data.me.money < window.prices.defence_post) {
			window.alert('You do not have enogh money to build a new defence post!\nYou need: ' + window.commas(window.prices.defencepost) + '\nYou have: ' + window.commas(window.data.me.money));
			document.getElementById('cancel_build_defence').innerHTML = '';
		} else {
			if (coords == false) {
				Action.Current = ActionState.BuildDefence;
				Map.SetState('action');
			} else {
				window.data.me.money -= window.prices.defence_post;

				window.data.defence_posts[window.me].push({
					x: coords[0].toFixed(2),
					y: coords[1].toFixed(2),
					health: 100,
					country: cid,
					contents: {}
				});

				Map.UpdateDefences();
				ControlBoard.Info();
				ControlBoard.Defence();
				ControlBoardEvents.ClickDefencePosts();  // To build a defence post, this popup must be open

				Update.File(Constants.AUTH, 'defence_posts.json', window.data.defence_posts); Update.Add('defence_posts.json');
				Update.File(Constants.AUTH, 'vars.json', window.data.vars);
			}
		}
		return 0;
	}

	// Get an ally (called by ControlBoardEvents.ClickGetAlly)
	static AddAlly(cid) {
		// Check that we have enough
		if (Calculations.GetAllyCost(cid) > window.data.me.money)
			alert('You do not have enough money to persuade ' + window.countries[cid].name + ' to ally with you!\nThey want: ' + window.commas(Calculations.GetAllyCost(cid)) + '\nYou have: ' + window.commas(window.data.me.money));
		else if (window.data.enemy.allies.indexOf(cid) !== -1)
			alert(window.countries[cid].name + ' is an ally of the enemy!');
		else {
			console.log('svg .country[data-id="' + cid.toUpperCase() + '"]');
			window.data.me.money -= Calculations.GetAllyCost(cid);
			window.data.me.allies.push(cid);
			document.querySelector('svg .country[data-id="' + cid.toUpperCase() + '"]').setAttribute('fill', window.data.me.ally_colour);

			ControlBoard.AlliesOverview();
			Update.File(Constants.AUTH, 'vars.json', window.data.vars);
			Update.Add('vars.json', [1]);
			ControlBoardEvents.UpdateIncome();
			ControlBoard.Info();
		}
		return 0;
	}

	// Sever an ally (get the small sum of the countries' GDP)
	static SeverAlly(cid, sudo = false) {
		let extra = '';

		// Check if silos in country
		let siloCount = 0;
		for (let silo of window.data.silos[window.me])
			if (silo.country == cid)
				siloCount += 1;

		if (siloCount > 0)
			extra = '\n\nYou will also lose the ' + window.commas(siloCount) + ' silo(s) that you own in this country...';

		// Ask for comfirmation
		if (sudo || window.confirm('Are you sure you want to sever your bond with ' + window.countries[cid].name + '?\nYou will only get the small cash sum of ' + window.commas(window.countries[cid].gdp) + '!' + extra)) {
			let sum = window.countries[cid].gdp;
			window.data.me.money += sum;
			window.discard(cid, window.data.me.allies);

			// Remove all silos in this country
			if (siloCount > 0) {
				for (let i = 0; i < window.data.silos[window.me].length;) {
					if (window.data.silos[window.me][i].country == cid)
						window.data.silos[window.me].splice(i, 1);
					else i += 1;
				}
				Map.UpdateSilos();
				Update.File(Constants.AUTH, 'silos.json', window.data.silos); Update.Add('silos.json'); Update.Add('silos.json');
				Update.Add('silos.json');
			}
			Update.File(Constants.AUTH, 'vars.json', window.data.vars);
			Update.Add('vars.json', [1]);
			ControlBoardEvents.UpdateIncome();
			ControlBoard.UpdateMoneyButtons();
			ControlBoard.Money();
		}
		return 0;
	}

	// Buy a weapon
	static BuyWeapon(container, weapon, buildingID) {
		// Check if weapon has a price i.e. exists
		if (window.prices[weapon] == null)
			alert("Cannot purchase " + window.display(weapon) + " as it is not for sale");

		// Check if have enough money
		else if (window.data.me.money < window.prices[weapon])
			alert("Cannot purchase " + window.display(weapon) + " as you do not have enought money\nYou need: " + window.commas(window.prices[weapon]) + "\nYou have: " + window.commas(window.data.me.money));

		// Check is silo exists
		else {
			window.data.me.money -= window.prices[weapon];
			Update.File(Constants.AUTH, 'vars.json', window.data.vars);

			switch (container) {
				case 'silo':
					if (window.data.silos[window.me][buildingID] == null) {
						alert("Container silo doesn't exist");
						return 0;
					}
					if (window.data.silos[window.me][buildingID].contents[weapon] == null)
						window.data.silos[window.me][buildingID].contents[weapon] = 1;
					else
						window.data.silos[window.me][buildingID].contents[weapon] += 1;

					// Sort weapon contents alphabetically (easy to find weapons)
					window.data.silos[window.me][buildingID].contents = sortObject(window.data.silos[window.me][buildingID].contents);

					if (Active.SiloViewing == buildingID)
						SiloEvents.ClickOn(buildingID);

					ControlBoard.SiloListOverview();
					Update.File(Constants.AUTH, 'silos.json', window.data.silos); Update.Add('silos.json');
					break;
				case 'defence_post':
					if (window.data.defence_posts[window.me][buildingID] == null) {
						alert("Container defence post doesn't exist");
						return 0;
					}
					if (window.data.defence_posts[window.me][buildingID].contents[weapon] == null)
						window.data.defence_posts[window.me][buildingID].contents[weapon] = 1;
					else
						window.data.defence_posts[window.me][buildingID].contents[weapon] += 1;

					// Sort weapon contents alphabetically (easy to find weapons)
					window.data.defence_posts[window.me][buildingID].contents = sortObject(window.data.defence_posts[window.me][buildingID].contents);

					if (Active.DefencePostViewing == buildingID)
						DefenceEvents.ClickOn(buildingID);

					ControlBoard.Defence();
					Update.File(Constants.AUTH, 'defence_posts.json', window.data.defence_posts); Update.Add('defence_posts.json');
					break;
				default:
					throw "ArgumentError: unrecognised container '" + container + "' (Action.BuyWeapon)";
			}
		}
		return 0;
	}

	// Select target for a weapons
	// isDefence - via 'Defence' section on panel?
	static WeaponPickTarget(event = null) {
		// If just called and not selected target yet...
		if (event == null) {
			Action.Current = ActionState.PickTarget;
			Map.SetState('aim');
		} else {
			// Add target blob
			if (Constants.TARGET.getElementById('weapon-target') != null) Constants.TARGET.getElementById('weapon-target').remove();
			let coords = Calculations.AdjustCoords(event.clientX, event.clientY);
			Constants.TARGET.appendChild(create_svg_element('circle', {
				cx: coords[0],
				cy: coords[1],
				r: Constants.TARGET_RADIUS,
				stroke: 'none',
				fill: window.data.me.weapon_colour,
				id: 'weapon-target'
			}));

			// Popup, but this time with an attached target event
			Active.TargetEvent = event;
			if (Active.LaunchingFromDefence)
				Action.Launch();
			else ControlBoardEvents.OpenPopup('Launch Sequence: Ready', ControlBoard.LaunchSequenceForm());

			return 0;
		}
	}

	// Launch a weapon
	static Launch() {
		let weapon = Active.LaunchingType;

		// if weapon is nothing...
		if (weapon == null || weapon == 'none') {
			window.alert('Cannot trigger launch sequence: please select weapon');
			return 0;
		}

		// Hide target blob; this will be replaced in GameEvent() instance of event object
		if (Constants.TARGET.getElementById('weapon-target') != null) Constants.TARGET.getElementById('weapon-target').remove();

		let from = Active.LaunchingFrom;
		let event = Active.TargetEvent;
		let coords = Calculations.AdjustCoords(event.clientX, event.clientY);

		// Assemble event object
		let obj;
		switch (window.types[weapon]) {
			case 'weapon': {
				let target = Map.GetElementInfo(event.target);		// array(2) { type, country }
				//console.log("Target: ", event.target, '\nReturn: ', target);
				//alert("Breakpoint: abort terminated.")
				//return 0;
				let from_coords = [Number(window.getSilo(from).x), Number(window.getSilo(from).y)];

				// Check if target is not out of range
				let dist = Map.DistancePoints(from_coords, coords);
				if (dist > window.weapons[weapon].range) {
					alert('Cannot fire weapon \'' + display(weapon) + '\' as the selected target is out of range of the missile\nRange is ' + commas(window.weapons[weapon].range) + ' while the distance to target is ' + commas(dist, 'round'));
					return 0;
				}
				obj = {
					type: window.types[weapon],
					weapon: weapon,
					target_type: target[0],
					target_country: target[1],
					target_coords: coords,
					target_user: window.getCountryOwner(target[1]),
					from_country: window.data.silos[window.me][from].country,
					from_user: window.me,
					from_silo: from,
					from_coords: from_coords,
					time: Time.FromInput()
				};
				break;
			}
			case 'defence': {
				let target = Map.GetElementInfo(event.target);		// array(2) { type, country }
				from = Map.GetDefencePostClosest(coords, Map.GetDefencePostsWith(weapon));
				let from_coords = [Number(window.data.defence_posts[window.me][from].x), Number(window.data.defence_posts[window.me][from].y)];

				// Check if target is not out of range
				let dist = Map.DistancePoints(from_coords, coords);
				if (dist > window.defences[weapon].range) {
					alert('Cannot fire defence weapon \'' + display(weapon) + '\' as the selected target is out of range of the missile\nRange is ' + commas(window.defences[weapon].range) + ' while the distance to target is ' + commas(dist, 'round'));
					document.querySelector('#cancel_launch_defence > button').click();
					return 0;
				}
				obj = {
					type: window.types[weapon],
					weapon: weapon,
					target_type: target[0],
					target_country: target[1],
					target_coords: coords,
					target_user: window.enemy,
					from_country: window.data.defence_posts[window.me][from].country,
					from_user: window.me,
					from_silo: from,
					from_coords: from_coords,
					time: Time.Now()
				};
				break;
			}
			default:
				throw 'ArgumentError: unrecognised weapon type \'' + window.types[weapon] + '\' (at Action.Launch)';
		}

		Map.RemoveRadiiMarkers();
		if (Active.LaunchingFromDefence) {
			// Update weapon stock
			window.data.defence_posts[window.me][from].contents[weapon] -= (istype(Active.LaunchingCount, 'int') ? Active.LaunchingCount : 1);
			if (window.data.defence_posts[window.me][from].contents[weapon] < 1) delete window.data.defence_posts[window.me][from].contents[weapon];

			Update.File(Constants.AUTH, 'defence_posts.json', window.data.defence_posts); Update.Add('defence_posts.json');
			ControlBoard.Defence();
		} else {
			// Create cooldown on silo (convert ms to s for display)
			if (window.weapons[obj.weapon].cooldown > 0) {
				Active.SiloCooldown[Active.LaunchingFrom] = Time.AddBits('now', window.weapons[obj.weapon].cooldown / 1000);

				// Set timeout until cooldown ends
				let siloid = Active.LaunchingFrom;
				setTimeout(function () {
					Active.SiloCooldown[siloid] = false;
					if (Active.SiloViewing == siloid) SiloEvents.ClickOn(siloid);
				}, window.weapons[obj.weapon].cooldown);
			}

			// Update weapon stock
			window.data.silos[window.me][from].contents[weapon] -= (istype(Active.LaunchingCount, 'int') ? Active.LaunchingCount : 1);
			if (window.data.silos[window.me][from].contents[weapon] < 1) delete window.data.silos[window.me][from].contents[weapon];

			// Save file (only needed locally though, so not UpdateFile)
			Update.File(Constants.AUTH, 'silos.json', window.data.silos); Update.Add('silos.json');
			ControlBoard.SiloListOverview();

			// Go back to viewing silo
			SiloEvents.ClickOn(Active.LaunchingFrom);
		}

		// Initiate event thing
		Events.Add(Constants.AUTH, obj);

		// Clean activity
		Events.CleanActivity();

		Sounds.play('buzzer');
		return 0;
	}

	// Abort launch sequence (when click blue button generated from Me.LaunchSequenceForm)
	static AbortLaunchSequence() {
		Map.SetState('idle');
		Action.Current = ActionState.None;
		ControlBoardEvents.ClosePopup();
		Events.CleanActivity();
		Map.RemoveRadiiMarkers();
		return 0;
	}

	// When a weapon lands; takes 'klass', a GameEvent class
	static WeaponLand(klass) {
		let weapon;
		switch (klass.type) {
			case 'weapon': weapon = window.weapons[klass.weapon]; break;
			case 'defence': weapon = window.defences[klass.weapon]; break;
		}
		let msg;

		// Explosion visual
		Map.PulseExplosion(klass.target_coords, weapon.radius);

		// If land in sea...
		if (klass.target_type == 'sea') {
			Sounds.play('explode_water');
			msg = ['<u>' + display(klass.from_user) + '\'s ' + display(klass.weapon) + '...</u>', '<br>Landed harmlessly in the ocean, causing no damage but killing many fishies :('];
		}
		// Else land in country
		else {
			msg = ['<u>' + display(klass.from_user) + '\'s ' + display(klass.weapon) + ' hit <img src="' + Map.GetFlagURL(klass.target_country) + '" class="flag_ref" /> ' + getCountryName(klass.target_country) + '</u>'];

			// Explosion sound
			switch (klass.weapon) {
				case 'short_range_missile':
					Sounds.play('explosion_srm');
					break;
				case 'long_range_missile':
					Sounds.play('explosion_lrm');
					break;
				case 'tsar':
					Sounds.play('tsar');
					break;
				default:
					Sounds.play('explosion_srm');
			}

			// If not homeland, decrease country health
			if (!(klass.target_country == window.data.vars.player_1.region || klass.target_country == window.data.vars.player_2.region)) {
				window.data.countries[klass.target_country].health -= weapon.damage;

				// If viewing country, refresh popup
				if (Active.CountryViewing == klass.target_country) {
					let code = Active.CountryViewing;
					ControlBoardEvents.ClosePopup();
					ControlBoard.LoadCountryInfo(code);
				}

				// Update income if your are the target_user
				if (klass.target_user == window.me) {
					ControlBoardEvents.UpdateIncome();
					ControlBoard.Info();
				}

				// If country is destroyed...
				if (window.data.countries[klass.target_country].health <= 0) {
					window.data.countries[klass.target_country].health = 0;
					msg.push('<b>Destroying</b> <img src="' + Map.GetFlagURL(klass.target_country) + '" class="flag_ref" /> <abbr title="' + getCountryName(klass.target_country) + '">' + klass.target_country + '</abbr>');
					if (window.getCountryOwner(klass.target_country) == window.me)
						Action.SeverAlly(klass.target_country, true);
				} else msg.push('<small>Dealing</small> ' + weapon.damage + '% <small>damage</small>');

				// If sender, update window.data.countries [countries.json]
				if (klass.from_user == window.me)
					Update.File(Constants.AUTH, 'countries.json', window.data.countries);
			}
			// Get all silos in range of explosion
			let silo_indexes = Map.GetSilosInRange(klass.target_coords[0], klass.target_coords[1], weapon.radius);
			let silo_hit = false;
			let adjustor = 0;

			// Cycle through silos and do stuff
			for (let player in silo_indexes) {
				for (let rindex of silo_indexes[player]) {
					// Get new index, in case any have been splice'd
					let index = rindex - adjustor;
					silo_hit = true;

					// Do damage
					window.data.silos[player][index].health -= weapon.silo_damage;

					// If silo is dead...
					if (window.data.silos[player][index].health <= 0) {
						adjustor += 1;
						Map.PulseExplosion([window.data.silos[player][index].x, window.data.silos[player][index].y], weapon.radius);
						Sounds.play('collapse');
						window.data.silos[player].splice(index, 1);
						msg.push('<b>Destroying</b> ' + display(player) + '\'s silo #' + index + '');
					} else {
						let text = '<small>Hitting</small> ' + display(player) + '\'s silo #' + index + ' <small>inflicting</small> ' + weapon.silo_damage + '% <small>damage</small>';
						// For each missile, there is a 1/chance_lose_weapon chance that it'll be destroyed by blast
						/*let lost = [];
						for (let weapon in window.data.silos[player][index]['contents']) {
							let count = parseInt(window.data.silos[player][index]['contents'][weapon]);
							if (isNaN(count)) continue;
							for (let i = 0; i < count; i += 1)
								if (rand(1, window.gamevars.chance_lose_weapon+1) == rand(1, window.gamevars.chance_lose_weapon+1))
									count -= 1;
							if (count < parseInt(window.data.silos[player][index]['contents'][weapon]))
								lost.push(count + ' <small>' + display(weapon, count > 1) + '</small>');
							window.data.silos[player][index]['contents'][weapon] = count;
							if (window.data.silos[player][index]['contents'][weapon] < 1) delete window.data.silos[player][index]['contents'][weapon];
						}
						msg.push(text + (lost.length > 0 ? '&nbsp;<small>and destroying</small>&nbsp;' + lost.join(', ') : ''));*/
					}
				}
			}

			// If a silo was hit...
			if (silo_hit) {
				// Only change display if one of your silos have been hit
				if (silo_indexes[window.me].length > 0) {
					Map.SilosChanged();
					ControlBoard.SiloListOverview();
				}
				if (Active.SiloViewing != null) ControlBoardEvents.ClosePopup();

				// Only update file [silos.json] if launcher == window.me
				if (klass.from_user == window.me) Update.File(Constants.AUTH, 'silos.json', window.data.silos); Update.Add('silos.json');
			}

			// Get all cities in range of Explosion
			let cities = Map.GetCitiesInRange(klass.target_coords[0], klass.target_coords[1], weapon.radius);
			let city_hit = false;

			for (let region in cities) {
				let owner = getCountryOwner(region);
				for (let city of cities[region]) {
					city_hit = true;
					let impact = (weapon.impact > window.data.cities[region][city].population ? window.data.cities[region][city].population : weapon.impact);
					window.data.cities[region][city].population -= impact;
					if (owner != null) window.data.vars[owner].population -= impact;

					if (window.data.cities[region][city].population <= 0) {
						Sounds.play('city_death');
						Map.PulseExplosion([window.cities[region.toLowerCase()][city][0], window.cities[region.toLowerCase()][city][1]], weapon.radius);
						msg.push('<small>Destroying</small> <img src="' + Map.GetFlagURL(region) + '" class="flag_ref" /> ' + display(city));
					} else
						msg.push('<small>Hitting</small> <img src="' + Map.GetFlagURL(region) + '" class="flag_ref" /> ' + display(city) + ' <small>taking</small> ' + commas(impact) + ' <small>lives</small>');
				}
			}

			if (city_hit) {
				ControlBoard.EnemyStats();
				Map.UpdateCities();
				Map.CheckWinner();	// Check if there is a winner
				if (Active.CityViewing != null) ControlBoardEvents.ClosePopup();

				// Only update file [silos.json] if launcher == window.me (avoid cross-updating from both sessions)
				if (klass.from_user == window.me) {
					if (cities.RU.length > 0) Update.File(Constants.AUTH, 'ru_cities.json', window.data.cities.RU);
					if (cities.US.length > 0) Update.File(Constants.AUTH, 'us_cities.json', window.data.cities.US);
				}

				// Only update income if one of your cities have been hit
				if (cities[window.data.me.region].length > 0) {
					ControlBoardEvents.UpdateIncome();
					ControlBoard.UpdateMoneyButtons();
					ControlBoard.Money();
				}
			}
		}
		ControlBoard.ShowMsg('<span style="color:' + window.data.vars[klass.from_user].colour + '">' + msg.join('<br>') + '</span>', null, true);
		return 0;
	}

	// Destroy all events given (used by defence weaponry)
	static DestroyEvents(events, explosion = false) {
		for (let eventid of events) {
			// Play explosion (be careful not to reference 'event' class in coords - else it won't be garbage collected)
			if (explosion) {
				Map.PulseExplosion([Events.List[eventid].coords[0], Events.List[eventid].coords[1]], window.gamevars.defence_explode_r, 'explosion_by_defence');
				Sounds.play('explosion_dm');
			}
			if (Constants.TARGET.getElementById('event-line-' + Events.List[eventid].id) != null) Constants.TARGET.getElementById('event-line-' + Events.List[eventid].id).remove();

			if (Active.SiloViewing == Events.List[eventid].from_silo) SiloEvents.ClickOn(Active.SiloViewing);

			// Call 'delete': remove all refrences and traces, so garbage collector can reclaim it
			Events.List[eventid].Delete();
		}
		if (Active.PopupViewing == 'events') ControlBoardEvents.ClickEventDetail();
		return 0;
	}
}
