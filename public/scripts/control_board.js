class ControlBoard {
	// Update general info on control board
	static Info() {
		document.getElementById('info_population').innerText = commas(window.data.me.population);
		document.getElementById('info_casualties').innerText = commas(window.data.me.population_100p - window.data.me.population) + " ppl";

		let health = Math.round((window.data.me.population / window.data.me.population_100p) * 100);
		document.getElementById('info_health_meter').value = health;
		document.getElementById('info_health_meter').setAttribute('title', health + '%');
		ControlBoard.Money();
		return 0;
	}

	// Update money stuff
	static Money() {
		document.getElementById('info_money').innerText = commas(window.data.me.money);
		document.getElementById('info_income').innerHTML = commas(window.data.me.income) + ' <small>/ ' + (window.gamevars.update_income_time / 1000) + 's</small>';
		return 0;
	}

	// Defence bit
	static Defence() {
		let html = '<table>';

		html += '<tr><td colspan="2"><button class="btn_blue" onclick="ControlBoardEvents.ClickDefencePosts();">Defence Posts</button></td></tr>';

		html += '<tr>';
		let defences = [];
		for (let item in window.defences) defences.push(item);
		if (Map.GetDefencePostsWith(...defences).length > 0) {
			html += '<td><button class="btn_blue" onclick="DefenceEvents.Launch();">Launch Defence: </button></td><td><select id="defence_launch_type">';
			for (let item in window.defences) {
				// Check if we have any
				let stock = Map.GetDefencePostsWith(item);
				if (stock.length > 0) html += '<option value="' + item + '">' + display(item) + '</option>';
			}
			html += '</select><br><span id="cancel_launch_defence"></span></td>';
		} else
			html += '<td colspan="2"><button class="btn_disabled" title="Fill your defence posts with defence weapons to be able to do this">Launch Defence Measure</button></td>';
		html += '</tr>';

		document.getElementById('launch_defence_missile').innerHTML = html + '</table>';
		return 0;
	};

	// Popup for viewing defence posts
	static DefencePostList() {
		let html = '';

		if (window.data.defence_posts[window.me].length > 0) {
			let posts = window.data.defence_posts[window.me];

			html += '<table><thead><tr><th>No</th><th><abbr title="Country based in">Co</abbr></th><th>Health</th><th>Inventory</th><th /></tr></thead><tbody>';
			for (let i = 0; i < posts.length; i += 1) {
				html += '<tr><td>' + i + '</td><td><img class="flag_ref" src="' + Map.GetFlagURL(posts[i]['country']) + '" title="' + posts[i]['country'] + '" /></td><td><meter class="small" min="0" low="30" high="75" optimum="90" max="100" value="' + posts[i].health + '" title="' + posts[i].health + '%" /></td>';
				let contents = [];
				for (let item in posts[i].contents)
					contents.push(posts[i].contents[item] + ' <abbr title="Item: ' + display(item) + '">' + getInitials(item, true) + '</abbr>');
				html += '<td><span class="text_vsmall">' + contents.join(', ') + '</span></td><td><button class="btn_blue" onclick="DefenceEvents.ClickOn(' + i + ')">' + Constants.SYMBOL_MORE + '</button></td></tr>';
			}
			html += '</tbody><tfoot></tfoot>';
			html += '<tr><td colspan="4" style="text-align: center">' + (window.prices.defence_post <= window.data.me.money ? '<button class="btn_blue" onclick="DefenceEvents.ClickBuildDefence()" title="Cost: ' + commas(window.prices.defence_post) + '">Construct Defence Post</button><br><span id="cancel_build_defence"></span>' : '<button class="btn_disabled" title="Cost: ' + commas(window.prices.defence_post) + '">Construct Defence Post</button>') + '</td></tr>';
			html += '</table>';
		} else {
			html += (window.prices.defence_post <= window.data.me.money ? '<button class="btn_blue" onclick="DefenceEvents.ClickBuildDefence()" title="Cost: ' + commas(window.prices.defence_post) + '">Construct Defence Post</button><br><span id="cancel_build_defence"></span>' : '<button class="btn_disabled" title="Cost: ' + commas(window.prices.defence_post) + '">Construct Defence Post</button>');
		}
		return html;
	};

	// Lists the players silos
	static SiloListOverview() {
		let silos = window.data.silos[window.me];
		let html = '';

		if (silos.length > 0) {
			html += '<table><thead><tr><th>No</th><th><abbr title="Country based in">Co</abbr></th><th>Health</th><th>Inventory</th><th /></tr></thead><tbody>';
			for (let i = 0; i < silos.length; i += 1) {
				html += '<tr onmouseover="Map.HighlightSilo(' + i + ')" onmouseleave="Map.UnHighlightSilo(' + i + ')"><td>' + i + '</td><td><img class="flag_ref" src="' + Map.GetFlagURL(silos[i]['country']) + '" title="' + silos[i]['country'] + '" /></td><td><meter class="small" min="0" low="30" high="75" optimum="90" max="100" value="' + silos[i].health + '" title="' + silos[i].health + '%" /></td>';
				let contents = [];
				for (let weapon in silos[i].contents)
					contents.push(silos[i].contents[weapon] + ' <abbr title="Weapon: ' + display(weapon) + '" onclick="SiloEvents.ClickAbbr(' + i + ', \'' + weapon + '\')">' + getInitials(weapon, true) + '</abbr>');
				html += '<td><span class="text_vsmall">' + contents.join(', ') + '</span></td><td><button class="btn_blue" onclick="SiloEvents.ClickOn(' + i + ')">' + Constants.SYMBOL_MORE + '</button></td></tr>';
			}
			html += '</tbody><tfoot>';
			html += '<tr><td colspan="4" style="text-align: center">' + (window.prices.silo <= window.data.me.money ? '<button class="btn_blue" id="btn_build_silo" onclick="SiloEvents.ClickBuildSilo()">Construct Silo</button><br><span id="cancel_build_silo"></span>' : '<button class="btn_disabled">Construct Silo</button>') + '</td></tr>';
			html += '</tfoot></table>';
		} else {
			html += '<small><i>You have no silos</i></small>'; //'&nbsp; <button class="btn_blue" onclick="ControlBoard.SiloHelp()">Help</button>';
			html += '<br>' + (window.prices.silo <= window.data.me.money ? '<button class="btn_blue" id="btn_build_silo" title="Cost: ' + commas(window.prices.silo) + '" onclick="SiloEvents.ClickBuildSilo()">Build a Silo</button><br><span id="cancel_build_silo"></span>' : '<button class="btn_disabled" title="Cost: ' + commas(window.prices.silo) + '">Build a Silo</button>');
		}

		document.getElementById('info_silos').innerHTML = html;
		return 0;
	};

	// When click on a silo, get info
	static GetSiloInfo(id) {
		if (Active.SiloCooldown[id] == null) Active.SiloCooldown[id] = false;

		id = parseInt(id);
		if (isNaN(id)) throw 'TypeError: expected <id> to be int: ControlBoard.GetSiloInfo(' + dump(id) + ')';
		Active.SiloViewing = parseInt(id);

		let silo = window.data.silos[window.me][id];
		let html = '<fieldset><legend>General</legend><table>';
		html += '<tr><td colspan="2"><a href="javascript:void(0)" onmouseover="Map.HighlightSilo(' + id + ')" onmouseout="Map.UnHighlightSilo(' + id + ')">Hover to view on map</a></td></tr>';
		html += '<tr><th>Location: </th><td><img src="' + Map.GetFlagURL(silo.country) + '" class="flag_ref" /> &nbsp;' + window.countries[silo.country]['name'] + '</td></tr>';
		html += '<tr><th>Health: </th><td><meter min="0" low="30" high="75" optimum="90" max="100" value="' + silo.health + '" title="' + silo.health + '%"></meter></td></tr>';
		html += '</table></fieldset><br>';

		html += '<fieldset><legend>Inventory</legend><table><tbody>';

		for (let weapon in window.weapons) {
			if (window.weapons[weapon].purchasable == false) continue;
			html += '<tr><th class="weapon_list_th">' + window.display(weapon) + ': </th><td>' + (silo.contents[weapon] == null ? 0 : commas(silo.contents[weapon])) + '</td>';
			html += '<td>' + (window.prices[weapon] <= window.data.me.money ? "<button class='btn_buy_weapon btn_green' onclick='Action.BuyWeapon(\"silo\", \"" + weapon + "\", " + id + ")' title='Cost: " + window.commas(window.prices[weapon]) + "'>Purchase</button>" : "<button class='btn_disabled' title='Cost: " + window.commas(window.prices[weapon]) + "'>Purchase</button>") + "</td></tr>";
		}
		html += '</tbody></table></fieldset><br>';

		html += '<fieldset><legend>Control Panel</legend>';
		if (Active.SiloCooldown[id] !== false) {
			html += '<b class="status-bad"><small>This silo is readying itself after a previous launch<br>It will be available for operation in:</b></small><br><br><span class="clock" id="silo-cooldown-clock-' + id + '"></span>';
			Time.CountdownClock('#silo-cooldown-clock-' + id, Time.Subtract(Active.SiloCooldown[id], 'now'), '000000', null, 'Ready');
		} else {
			html += '<table>';
			html += '<tr><td class="centre">' + (Object.keys(window.data.silos[window.me][id].contents).length > 0 ? '<button class="btn_blue" onclick="SiloEvents.ClickLaunch(' + id + ')">Schedule Launch</button>' : '<button class="btn_disabled" title="You need weapons in this silo to be able to schedule a launch">Schedule Launch</button>') + '</td></tr>';
			html += '<tr><td class="centre"><button class="btn_red" onclick="Action.DecomissionSilo(' + id + ')">Decomission Silo</button></td></tr>';
			html += '</table>';;
		}
		html += '</fieldset><br>';

		let events = Events.GetEventsInSilo(id);
		if (events.length > 0) {
			html += '<fieldset><legend>Activity</legend><table border="1" class="pretty"><thead><tr><th>Weapon</th><th>Status</th><th>Target</th></tr></thead><tbody>';
			for (let eid of events) {
				let event = Events.List[eid];
				html += '<tr><td><small>' + display(event.weapon) + '</small></td><td><span class="clock" id="silo-clock-' + eid + '"></span></td><td>' + (event.target_country == 'sea' ? '<small>Ocean</small>' : '<img src="' + Map.GetFlagURL(event.target_country) + '" class="flag_ref" /> ' + event.target_country) + '</td></tr>';
				if (window.data.popup_silo[id][eid] == null)
					window.data.popup_silo[id][eid] = Time.CountdownClock('#silo-clock-' + eid, Time.Subtract(event.time, 'now'), '000000', '000010', Constants.WEAPON_LAUNCHED_TEXT, id, eid);
			}
			html += '</tbody></table></fieldset>';
		}

		return html;
	};

	// Form for launch sequence of weapon
	static LaunchSequenceForm() {
		Active.PopupViewing = 'launch_seq';
		let html = '';
		let target = (Active.TargetEvent == null ? null : Map.GetElementInfo(Active.TargetEvent.target)[1]);

		// Information
		html += '<fieldset><legend>Information</legend><table><tr><th>Silo: </th><td>Silo #' + Active.LaunchingFrom + '</td></tr><tr><th>Location: </th><td><img src="' + Map.GetFlagURL(window.data.silos[window.me][Active.LaunchingFrom].country) + '" class="flag_ref" /> <small>' + window.countries[window.data.silos[window.me][Active.LaunchingFrom].country].name + '</small></td></tr></table></fieldset>';

		// Weapon Using
		html += '<br><fieldset><legend>Weapon</legend><select onchange="SiloEvents.SelectLaunchWeapon(this.value)"><option value="none" ' + (Active.LaunchingType == null ? 'selected' : '') + 'disabled>Select a Weapon</option>';
		for (let weapon in window.data.silos[window.me][Active.LaunchingFrom]['contents'])
			html += '<option value="' + weapon + '"' + (Active.LaunchingType == weapon ? 'selected' : '') + '>' + display(weapon) + '</option>';
		html += '</select></fieldset><br>';

		// Draw radius of missile range
		if (Active.LaunchingType != null) {
			if (Constants.TARGET.getElementById('weapon-radius') != null) Constants.TARGET.getElementById('weapon-radius').remove();
			/*Constants.TARGET.appendChild(create_svg_element('circle', {
				cx: window.data.silos[window.me][Active.LaunchingFrom].x,
				cy: window.data.silos[window.me][Active.LaunchingFrom].y,
				r: window.weapons[Active.LaunchingType].range,
				class: 'weapon_radius',
				id: 'weapon-radius'
			}));*/
			Constants.TARGET.insertAdjacentHTML('afterbegin', '<circle cx="' + window.data.silos[window.me][Active.LaunchingFrom].x + '" cy="' + window.data.silos[window.me][Active.LaunchingFrom].y + '" r="' + window.weapons[Active.LaunchingType].range + '" id="weapon-radius" class="weapon_radius"></circle>');
		}

		// Set Target
		html += '<fieldset><legend>Target</legend><table><tr><td>' + (target == null ? 'N/A' : (target == 'sea' ? 'The Ocean' : '<img src="' + Map.GetFlagURL(target) + '" class="flag_ref" /> <small>' + window.countries[target]['name'] + '</small>')) + '</td></tr><tr><td colspan="2"><center>' + (Active.LaunchingType == null || Active.LaunchingCount == null ? '<button title="Select weapon type first" class="btn_disabled">SELECT TARGET</button>' : '<button onclick="Action.WeaponPickTarget()" class="btn_blue">SELECT TARGET</button>') + '</center></td></tr></table></fieldset>';

		// Launch Time
		html += '<br><fieldset><legend>Launch Time</legend>' + (target == null ? '<select disabled><option>--</option></select> <b>:</b> <select disabled><option>--</option></select> <b>:</b> <select disabled><option>--</option></select>' : Time.GenInput()) + '</fieldset>';

		// Launch Button
		html += '<br>' + (target == null ? '<button class="btn_disabled">LAUNCH</button>' : '<button class="btn_red" onclick="Action.Launch()">LAUNCH</button>');
		html += '<br><br><button class="btn_blue" onclick="Action.AbortLaunchSequence()">Abort Launch Sequence</button>';

		return html;
	};

	// When click on a defence post, get info
	static GetDefencePostInfo(id) {
		id = parseInt(id);
		if (isNaN(id)) throw 'TypeError: expected <id> to be int: ControlBoard.GetDefencePost(' + dump(id) + ')';
		Active.DefencePostViewing = parseInt(id);

		let post = window.data.defence_posts[window.me][id];
		let html = '<fieldset><legend>General</legend><table>';
		html += '<tr><th>Location: </th><td><img src="' + Map.GetFlagURL(post.country) + '" class="flag_ref" /> &nbsp;' + window.countries[post.country]['name'] + '</td></tr>';
		html += '<tr><th>Health: </th><td><meter min="0" low="30" high="75" optimum="90" max="100" value="' + post.health + '" title="' + post.health + '%"></meter></td></tr>';
		html += '</table></fieldset><br>';
		html += '<fieldset><legend>Inventory</legend><table><tbody>';

		for (let item in window.defences) {
			html += '<tr><th class="weapon_list_th">' + window.display(item) + ': </th><td>' + (post.contents[item] == null ? 0 : commas(post.contents[item])) + '</td>';
			html += '<td>' + (window.prices[item] <= window.data.me.money ? "<button class='btn_buy_weapon btn_green' onclick='Action.BuyWeapon(\"defence_post\", \"" + item + "\", " + id + ")' title='Cost: " + window.commas(window.prices[item]) + "'>Purchase</button>" : "<button class='btn_disabled' title='Cost: " + window.commas(window.prices[item]) + "'>Purchase</button>") + "</td></tr>";
		}
		html += '</tbody></table></fieldset><br>';
		return html;

		html += '<fieldset><legend>Control Panel</legend>';
		if (Active.SiloCooldown[id] !== false) {
			html += '<b class="status-bad"><small>This silo is readying itself after a previous launch<br>It will be available for operation in:</b></small><br><br><span class="clock" id="silo-cooldown-clock-' + id + '"></span>';
			Time.CountdownClock('#silo-cooldown-clock-' + id, Time.Subtract(Active.SiloCooldown[id], 'now'), '000000', null, 'Ready');
		} else {
			html += '<table>';
			html += '<tr><td class="centre">' + (Object.keys(window.data.silos[window.me][id].contents).length > 0 ? '<button class="btn_blue" onclick="SiloEvents.ClickLaunch(' + id + ')">Schedule Launch</button>' : '<button class="btn_disabled" title="You need weapons in this silo to be able to schedule a launch">Schedule Launch</button>') + '</td></tr>';
			html += '<tr><td class="centre"><button class="btn_red" onclick="Action.DecomissionSilo(' + id + ')">Decomission Silo</button></td></tr>';
			html += '</table>';;
		}
		html += '</fieldset><br>';

		let events = Events.GetEventsInSilo(id);
		if (events.length > 0) {
			html += '<fieldset><legend>Activity</legend><table border="1" class="pretty"><thead><tr><th>Weapon</th><th>Status</th><th>Target</th></tr></thead><tbody>';
			for (let eid of events) {
				let event = Events.List[eid];
				html += '<tr><td><small>' + display(event.weapon) + '</small></td><td><span class="clock" id="silo-clock-' + eid + '"></span></td><td>' + (event.target_country == 'sea' ? '<small>Ocean</small>' : '<img src="' + Map.GetFlagURL(event.target_country) + '" class="flag_ref" /> ' + event.target_country) + '</td></tr>';
				if (window.data.popup_silo[id][eid] == null)
					window.data.popup_silo[id][eid] = Time.CountdownClock('#silo-clock-' + eid, Time.Subtract(event.time, 'now'), '000000', '000010', Constants.WEAPON_LAUNCHED_TEXT, id, eid);
			}
			html += '</tbody></table></fieldset>';
		}

		return html;
	};

	// Weapon specs menu; opened from ControlBoardEvents.ClickWeaponInfo() on button 'view weapon specs'.
	static WeaponSpecsMenu() {
		let html = '';
		html += '<ul>';

		for (let weapon in window.weapons)
			html += '<li><a href="javascript:void(0)" onclick="ControlBoardEvents.ClickWeaponSpecsFocused(\'' + weapon + '\')">' + window.display(weapon) + '</a></li>';

		html += '</ul>';
		return html;
	};

	// Weapon specs for a specified weapon. opened from clicked link in 'ControlBoardEvents.ClickWeaponSpecsFocused()'.
	static WeaponSpecsFocused(weapon) {
		let html = '<a href="javascript:void(0);" onclick="ControlBoardEvents.ClickWeaponInfo();">Specs Menu</a><br><br><table border="1" class="pretty"><thead><tr><th>Spec</th><th>Value</th><th /></tr></thead><tbody>';

		html += '<tr><th>Cost: </th><td>' + commas(window.prices[weapon]) + '</td><td /></tr>';
		for (let spec in window.weapons[weapon]) {
			html += '<tr><th>' + display(spec) + ': </th><td>' + (istype(window.weapons[weapon][spec], 'int', 'float') ? commas(window.weapons[weapon][spec], 2) : window.weapons[weapon][spec]) + '</td><td>[ <b><a href="javascript:void(0)" title="' + window.weapon_descriptions[spec] + '">?</a></b> ]</td></tr>';
		}
		html += '</tbody></table>';

		return html;
	};

	// Overview list of allies
	static AlliesOverview() {
		let allies = window.data.me.allies;
		let html = '';
		if (allies.length == 0)
			html = '<i>You have no allies</i>';
		else {
			for (let ally of allies)
				html += '<img src="' + Map.GetFlagURL(ally) + '" onclick="ControlBoard.LoadCountryInfo(\'' + ally + '\')" onmouseover="Map.HighlightCountry(\'' + ally + '\')" onmouseleave="Map.UnHighlightCountry(\'' + ally + '\')" class="flag_med hover" title="' + getCountryName(ally) + ' (' + ally + ')" />';
			html += '<br><br><button class="btn_blue" onclick="ControlBoardEvents.LoadAllies()">' + Constants.SYMBOL_MORE + '</button>';
		}

		document.getElementById('info_allies').innerHTML = html;
		return 0;
	};

	// Allies in-depth
	static AlliesDetail() {
		let allies = window.data.me.allies;
		let html = '<table>';

		for (let ally of allies)
			html += '<tr><td><img src="' + Map.GetFlagURL(ally) + '" class="flag_med" /></td><td>' + window.countries[ally].name + '</td><td><table><tr><td><meter min="0" low="30" high="75" optimum="90" max="100" value="' + window.data.countries[ally].health + '"></meter></td></tr><tr><td>' + window.commas(Calculations.GetAllyIncome(ally)) + ' <small>/ ' + window.commas(window.gamevars.update_income_time / 1000) + 's</small></td></tr></table></td><td><button class="btn_blue" onclick="ControlBoard.LoadCountryInfo(\'' + ally + '\')">' + Constants.SYMBOL_MORE + '</button></td></tr>';
		html += '</table>';

		return html;
	};

	// Display country information (when click on country when Action.Current == ActionState.None)
	static LoadCountryInfo(cid) {
		let info = window.countries[cid];
		Active.CountryViewing = cid;
		Active.PopupViewing = 'country';
		let status = '';

		if (cid == window.data.me.region)
			status = '<b class="status_good">My Mainland</b><br><b>Generation: </b>' + window.commas(Calculations.GetHomeIncome()) + '<small> / ' + window.commas(window.gamevars.update_income_time / 1000) + ' sec(s)</small>';
		else if (cid == window.data.enemy.region)
			status = '<b class="status_bad">Enemy\'s Mainland</b>';
		else if (window.data.me.allies.indexOf(cid) !== -1)
			status = '<b class="status_good">Ally</b><br><b>Generation: </b>' + window.commas(Calculations.GetAllyIncome(cid)) + '<small> / ' + window.commas(window.gamevars.update_income_time / 1000) + 's</small><br><br><button class="btn_red" onclick="ControlBoardEvents.ClickSeverAlly(\'' + cid + '\')">Sever Ally</button>';
		else if (window.data.enemy.allies.indexOf(cid) !== -1)
			status = '<b class="status_bad">Enemy Ally</b>';
		else {
			// Not owned by anyone; is available to ally-ify
			let price = Calculations.GetAllyCost(cid);
			status = '<b class="status_none">None</b><br><b>Generation: </b>' + window.commas(Calculations.GetAllyIncome(cid)) + '<small> / ' + window.commas(window.gamevars.update_income_time / 1000) + 's</small><br><b>Price: </b>';
			if (window.data.countries[cid].health <= 0)
				status += 'N/A<br><br><fieldset><i>Country has been destroyed; cannot ally</i></fieldset>';
			else status += (price <= window.data.me.money ? window.commas(price) + '<br><br><button class="btn_blue" onclick="Action.AddAlly(\'' + cid + '\')">Add as Ally</button>' : '<span class="status_bad">' + window.commas(price) + '</span><br><br><button class="btn_disabled">Add as Ally</button>');

		}

		let html = '<center><a href="javascript:void(0);" onclick="ControlBoardEvents.ClickCountryList()">Back: Country List</a><br><br>';
		html += '<img class="flag_title" src="' + Map.GetFlagURL(cid) + '" /><br><a href="javascript:void(0)" onmouseover="Map.HighlightCountry(\'' + cid + '\')" onmouseleave="Map.UnHighlightCountry(\'' + cid + '\')"><i>Hover to view on map</i></a><br><table><tr><th>Code: </th><td>' + cid + '</td></tr><tr><th>Name: </th><td>' + info.name + '</td></tr><tr><th>Population: </th><td>' + window.commas(info.population) + '</td></tr><tr><th>Area: </th><td>' + window.commas(info.area) + ' km<sup>2</sup></td></tr><tr><th>GDP: </th><td>USD $' + window.commas(info.gdp) + '</td></tr>';

		// If mainland, health is calculated differently
		if (window.data.me.region == cid || window.data.enemy.region == cid) {
			let owner = getCountryOwner(cid);
			let health = Math.round((window.data.vars[owner].population / window.data.vars[owner].population_100p) * 100);
			html += '<tr><th><abbr title="population &divide; original population">Health</abbr>: </th><td><meter min="0" low="30" high="75" optimum="90" max="100" value="' + health + '" title="' + health + '%"></meter></td></tr>';
		} else
			html += '<tr><th>Health: </th><td><meter min="0" low="30" high="75" optimum="90" max="100" value="' + window.data.countries[cid].health + '" title="' + Math.round(window.data.countries[cid].health) + '%"></meter></td></tr>';

		html += '</table><br><br><b>Status: </b>' + status;
		html += '</center>';
		ControlBoardEvents.OpenPopup('Country', html);
		return 0;
	};

	// Get list of all countries on map
	static AllCountryList() {
		let html = '<table border="1" class="pretty"><thead><tr><th>Flag</th><th>Code</th><th colspan="2">Name</th></tr></thead><tbody>';

		for (let country in window.countries)
			html += '<tr><td><img src="' + Map.GetFlagURL(country) + '" class="flag_med hover" onmouseover="Map.HighlightCountry(\'' + country + '\')" onmouseout="Map.UnHighlightCountry(\'' + country + '\')"/></td><td>' + country + '</td><td><small>' + getCountryName(country) + '</small></td><td><button class="btn_blue" onclick="ControlBoard.LoadCountryInfo(\'' + country + '\')">' + Constants.SYMBOL_MORE + '</button></td></tr>';
		html += '</tbody></table>';

		return html;
	};

	// When click on city, return the city's info
	static GetCityInfo(region, name) {
		Active.CityViewing = name;
		let binfo = window.data.cities[region][name];
		let html = '<table>';
		html += '<tr><th>Country: </th><td><img src="' + Map.GetFlagURL(region) + '" class="flag_ref" /> &nbsp;' + window.countries[region.toUpperCase()]['name'] + '</td></tr>';
		html += '<tr><th>Name: </th><td>' + display(name) + '</td></tr>';

		if (region.toUpperCase() == window.data.me.region) {
			html += '<tr><th>Generation: </th><td>' + commas(Calculations.GetCityIncome(region, name)) + ' <small>/ ' + commas(window.gamevars.update_income_time / 1000) + ' sec(s)</small></td></tr>'
			html += '<tr><th>Population: </th><td>' + commas(binfo.population) + '</td></tr>';
		} else {
			html += '<tr><th>Generation: </th><td>???</td></tr>';
			html += '<tr><th>Population: </th><td>???</td></tr>';
		}
		let health = Math.round((binfo.population / binfo.population_100p) * 100);
		html += '<tr><th><abbr title="population &divide; original population">Health</abbr>: </th><td><meter min="0" low="30" high="75" optimum="90" max="100" value="' + health + '" title="' + health + '%"></meter></td></tr>';

		return html + '</table>';
	};

	static GameOverviewStats() { ControlBoard.EnemyStats(); };
	static EnemyStats() {
		let health = Math.round((window.data.enemy.population / window.data.enemy.population_100p) * 100);
		document.getElementById('enemy_health').innerHTML = '<meter class="small" min="0" low="30" high="75" optimum="90" max="100" value="' + health + '" title="' + health + '%"></meter>';
		return 0;
	};

	// Updates all buttons which have dependencies on money
	static UpdateMoneyButtons() {
		ControlBoard.Money();
		ControlBoard.SiloListOverview();
		return 0;
	};

	// Event list overview
	static EventListOverview(all = false) {
		let html = '';
		let scheduled = (all ? Events.Scheculed.length : 0);
		let active = (all ? Events.Active.length : 0);

		if (!all) {
			for (let eid of Events.Scheduled) if (Events.List[eid].from_user == window.me) scheduled += 1;
			for (let eid of Events.Active) if (Events.List[eid].from_user == window.me) active += 1;
		}

		html += '<table><tr><th>Scheduled: </th><td>' + commas(scheduled) + '</td><td rowspan="2"><button class="btn_blue" onclick="ControlBoardEvents.ClickEventDetail()">' + Constants.SYMBOL_MORE + '</button></td></tr>';
		html += '<tr><th>Active: </th><td>' + commas(active) + '</td></tr></table>';
		document.getElementById('info_events').innerHTML = html;

		return 0;
	};

	// List of all events
	static EventListDetail() {
		let html = '<fieldset><legend>Scheduled Events</legend><table border="1" class="pretty"><thead><tr><th>Type</th><th>Countdown</th><th /></tr></thead><tbody>';
		for (let eid of Events.Scheduled) {
			if (Events.List[eid].from_user != window.me) continue;
			html += '<tr><td>' + Events.List[eid]['type'] + '</td><td><span class="clock" id="clock-' + eid + '"></span></td><td><button class="btn_blue" onclick="ControlBoardEvents.ClickEventFocused(' + eid + ')">' + Constants.SYMBOL_MORE + '</button></td></tr>';
			//console.log('START TIME = Time.Subtract(' + dump(Events.List[eid]['time']) + ', ' + dump(Time.Now()) + ') = ' + Time.Subtract(Events.List[eid]['time'], 'now'));
			Time.CountdownClock('#clock-' + eid, Time.Subtract(Events.List[eid]['time'], 'now'), '000000', '000010', 'Activated');
		}
		html += '</tbody></table></fieldset><br>';

		html += '<fieldset><legend>Active Events</legend><table border="1" class="pretty"><thead><tr><th>ID</th><th>Type</th><th /></tr></thead><tbody>';
		for (let eid of Events.Active) {
			if (Events.List[eid].from_user != window.me) continue;
			html += '<tr><td><small>' + eid + '</small></td><td>' + Events.List[eid]['type'] + '</td><td><button class="btn_blue" onclick="ControlBoardEvents.ClickEventFocused(' + eid + ')">' + Constants.SYMBOL_MORE + '</button></td></tr>';
		}
		html += '</tbody></table></fieldset>';

		return html;
	};

	// View detailed info of an event
	static FocusedEventInfo(eid) {
		let html = '<textarea rows="25" cols="40">' + dump(Events.List[eid]) + '</textarea>';
		return html;
	};

	// Show message in message box
	static ShowMsg(msg, pulse = null, prepend = true, line = true) {
		if (prepend) document.getElementById('info_message').innerHTML = msg + (line ? '<hr>' : '') + document.getElementById('info_message').innerHTML;
		else document.getElementById('info_message').innerHTML = msg;

		if (dump(pulse, true) == 'int')
			setTimeout(function () {
				document.getElementById('info_message').innerHTML = '';
			}, pulse);
		return 0;
	};

	// Load text from window.data.message_old to #info_message
	static ShowMsgFromHistory() {
		let html = textToHtml(window.data.message_old);
		document.getElementById('info_message').innerHTML = html;
		return 0;
	};
}
