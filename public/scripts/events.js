class DocumentEvents {
	static Keys() {
		// Keybindings
		document.body.addEventListener('keydown', function(event) {
			switch (event.keyCode) {
				case 13:
					// 'Enter'		-> proceed with action; depends on Action.PopupViewing
					if (Active.PopupViewing == 'launch_seq' && Active.TargetEvent != null && Active.LaunchingFrom != null && Active.LaunchingType != null) Action.Launch();
					break;
				case 27:
					// 'Escape'		->		Close popups/cancel events
					Action.CancelAll();
					if (Active.PopupViewing != null) ControlBoardEvents.ClosePopup(true);
					break;
				case 65:
					// 'a'		-> open allies popup
					ControlBoardEvents.LoadAllies();
					break;
				case 67:
					// 'c'		-> cancel all events
					Action.CancelAll();
					break;
				case 68:
					// 'd'		-> open defence post list popup
					ControlBoardEvents.ClickDefencePosts();
					break;
				case 69:
					// 'e'		-> open events popup
					ControlBoardEvents.ClickEventDetail();
					break;
			}
		});
	};
}

class SiloEvents {
	static AddListeners() {
		for (let el of Constants.TARGET.querySelectorAll('.silo')) {
			el.addEventListener('mouseover', function(event){
				SiloEvents.HoverOn(el);
			});
			el.addEventListener('mouseleave', function(event){
				SiloEvents.HoverOff(el);
			});
			el.addEventListener('mouseup', function(event){
				SiloEvents.ClickOn(el.getAttribute('data-id'));
			});
		}
		return 0;
	};

	static HoverOn(elem) {
		let id = elem.getAttribute('data-id');
		document.getElementById('info_map_hover').innerHTML = '<div class="info_map_hover_content"><center><b>Silo #' + id + '</b></center>' + Map.SiloHtml(id) + '</div>';
		return 0;
	};

	static HoverOff(elem) {
		document.getElementById('info_map_hover').innerHTML = '';
		return 0;
	};

	static ClickOn(id) {
		Active.PopupViewing = 'silo';
		ControlBoardEvents.OpenPopup('Silo #' + id, ControlBoard.GetSiloInfo(id));
		return 0;
	};

	// 'Build Silo' button has been clicked
	static ClickBuildSilo() {
		document.getElementById('cancel_build_silo').innerHTML = Action.CancelActionBtn('cancel_build_silo', 'Abort Construction');
		Action.BuildSilo();
		return 0;
	};

	// Click on an abbreviation in 'inverntory' overview
	static ClickAbbr(silo, weapon) {
		Active.LaunchingFrom = silo;
		Active.LaunchingType = weapon;
		Active.LaunchingCount = 1;
		ControlBoardEvents.OpenPopup('Launch Sequence: Initiated', ControlBoard.LaunchSequenceForm());
		return 0;
	};

	// Launch missile (initiate launch button in silo info)
	static ClickLaunch(silo) {
		Active.LaunchingFrom = silo;
		ControlBoardEvents.OpenPopup('Launch Sequence: Start', ControlBoard.LaunchSequenceForm());
		return 0;
	};

	// From initiate launch screen; select missile
	static SelectLaunchWeapon(weapon) {
		Active.LaunchingType = weapon;
		Active.LaunchingCount = 1;
		ControlBoardEvents.OpenPopup('Launch Sequence: Initiated', ControlBoard.LaunchSequenceForm());
		return 0;
	};

	// From initiate launch screen; select weapon count
	static SelectLaunchCount(count) {
		Active.LaunchingCount = parseInt(count);
		ControlBoardEvents.OpenPopup('Launch Sequence: Initiated', ControlBoard.LaunchSequenceForm());
		return 0;
	};
};

// For defence posts
class DefenceEvents {
	static AddListeners() {
		for (let el of Constants.TARGET.querySelectorAll('.defence_post')) {
			el.addEventListener('mouseover', function(event){
				DefenceEvents.HoverOn(el);
			});
			el.addEventListener('mouseleave', function(event){
				DefenceEvents.HoverOff(el);
			});
			el.addEventListener('mouseup', function(event){
				DefenceEvents.ClickOn(el.getAttribute('data-id'));
			});
		}
		return 0;
	};

	static HoverOn(elem) {
		let id = elem.getAttribute('data-id');
		let html = Map.DefencePostHtml(id);
		document.getElementById('info_map_hover').innerHTML = '<div class="info_map_hover_content"><center><b>Defence Post #' + id + '</b></center>' + html + '</div>';
		return 0;
	};

	static HoverOff(elem) {
		document.getElementById('info_map_hover').innerHTML = '';
		return 0;
	};

	static ClickOn(id) {
		Active.PopupViewing = 'defence_post';
		Active.DefencePostViewing = id;
		ControlBoardEvents.OpenPopup('Defence Post #' + id, ControlBoard.GetDefencePostInfo(id));
		return 0;
	};
	// 'Build Defence Post' button has been clicked
	static ClickBuildDefence() {
		document.getElementById('cancel_build_defence').innerHTML = Action.CancelActionBtn('cancel_build_defence', 'Abort Construction');
		Action.BuildDefence();
		return 0;
	};

	// Click on 'launch defence missile'
	static Launch() {
		if (Active.LaunchingFromDefence) return 0;

		let type = document.getElementById('defence_launch_type').value;
		if (window.defences[type] == null) return 0;

		let missiles = Map.GetDefencePostsWith('defence_missile');
		if (missiles.length < 1) alert("Cannot launch defence missile: no defence post with a defence missile could be found");
		else {
			document.getElementById('cancel_launch_defence').innerHTML = Action.CancelActionBtn('cancel_launch_defence', 'Cancel');
			document.getElementById('defence_launch_type').setAttribute('disabled', true)
			Active.LaunchingFromDefence = true;
			Active.LaunchingType = type;
			Action.Current = ActionState.PickTarget;
			Map.SetState('aim');
			for (let i = 0; i <  window.data.defence_posts[window.me].length; i += 1)
				Constants.TARGET.appendChild(create_svg_element('circle', {
					cx: window.data.defence_posts[window.me][i].x,
					cy: window.data.defence_posts[window.me][i].y,
					r: window.defences[type].range,
					class: 'weapon_radius',
					id: 'defence-radius-' + i
				}));
		}
		return 0;
	};
}

class CityEvents {
	static AddListeners() {
		for (let el of document.querySelectorAll('svg circle.city')) {
			el.addEventListener('mouseover', function(event){
				CityEvents.HoverOn(el);
			});
			el.addEventListener('mouseleave', function(event){
				CityEvents.HoverOff(el);
			});
			el.addEventListener('mouseup', function(event){
				CityEvents.ClickOn(el);
			});
		}
	};

	static HoverOn(elem) {
		let html = Map.CityHtml(elem.getAttribute('data-region'), elem.getAttribute('data-name'));
		document.getElementById('info_map_hover').innerHTML = '<div class="info_map_hover_content"><center><b>City</b></center>' + html + '</div>';
		return 0;
	};

	static HoverOff(elem) {
		document.getElementById('info_map_hover').innerHTML = '';
		return 0;
	};

	static ClickOn(elem) {
		let cid = elem.getAttribute('data-region'),
			name = elem.getAttribute('data-name');
		ControlBoardEvents.OpenPopup('City', ControlBoard.GetCityInfo(cid, name));
		return 0;
	};
}

class MapEvents {
	// When mouse clicks on the map (fed from initClick and initClickCountry)
	static Click(event, onland = false) {
		if (onland) event.stopPropagation();  // Stop event from SVG also triggering (with land=false)
		let cid = event.target.getAttribute('data-id');

		// Get coords relative to #map
		let coords = Calculations.AdjustCoords(event.clientX, event.clientY);

		// Action now depend on Action.Current
		switch (Action.Current) {
			case ActionState.BuildSilo:
				if (!onland) {
					alert("Cannot build silo in the sea or in non-open land! (e.g. on a silo, on a city)");
				// Check if land clicked on has data-id of window.me's territory
				} else if (event.target.getAttribute('data-id') != window.data.me.region && window.data.me.allies.indexOf(cid) === -1) {
					alert("Cannot build your silo in " + window.countries[cid]['name'] + ": they aren't an ally");
				} else {
					Sounds.Play('beep')
					Action.Current = ActionState.None
					Map.SetState('idle');
					Action.BuildSilo(coords, cid);
				}
				break;
			case ActionState.BuildDefence:
				if (!onland) {
					alert("Cannot build defence post in the sea or in non-open land! (e.g. on a silo, on a city)");
				// Check if land clicked on has data-id of window.me's territory
				} else if (event.target.getAttribute('data-id') != window.data.me.region && window.data.me.allies.indexOf(cid) === -1) {
					alert("Cannot build your defence post in " + window.countries[cid]['name'] + ": they aren't an ally");
				} else {
					Sounds.Play('beep')
					Action.Current = ActionState.None
					Map.SetState('idle');
					Action.BuildDefence(coords, cid);
				}
				break;
			case ActionState.PickTarget:
				Sounds.Play('beep')
				Action.Current = ActionState.None;
				Map.SetState('idle');
				Active.TargetEvent = event;
				Action.WeaponPickTarget(event);
				break;
			case ActionState.None:
				// In this case, show detailed country info
				if (onland) ControlBoard.LoadCountryInfo(cid);
				break;
		}
	};

	// When mouse clicks somewhere on the map...
	static InitClick() {
		Constants.TARGET.addEventListener('mouseup', function(event) {
			MapEvents.Click(event, false);
		});
	};

	// When mouse moves over non-country (sea, city, silo) ...
	static InitOver() {
		Constants.TARGET.addEventListener('mouseover', function(event) {
			// If hovering over city (etc...) do not change country info
			if (Map.GetState() != 'hover') document.getElementById('info_country_hover').innerHTML = '';
		});
	};

	// When mouse clicks on a country...
	static InitClickCountry() {
		for (let el of document.querySelectorAll('svg .country')) {
			el.addEventListener('mouseup', function(event) {
				MapEvents.Click(event, true);
			});
		}
	};

	// When mouse moves over a country...
	static InitOverCountry() {
		for (let el of document.querySelectorAll('svg .country')) {
			el.addEventListener('mouseover', function(event) {
				event.stopPropagation();
				if (window.isAdmin) eventMouseMove(event);
				MapEvents.OverCountry(event.target);
			});
		}
	};

	// Get country info when hover over a country (provide element) ...
	static OverCountry(el) {
		let code = el.getAttribute('data-id');
		document.getElementById('info_country_hover').innerHTML = '<div class="info_map_hover_content"><center><img class="flag_title" src="' + Map.GetFlagURL(code) + '" /><br>' + code + '<br></center><meter min="0" low="30" high="75" optimum="90" max="100" value="' + window.data.countries[code].health + '"></meter></div>';
		return 0;
	};
}

// Events on control board
class ControlBoardEvents {
	static OpenPopup(title, content) {
		document.getElementById('control_board').setAttribute('hidden', 'hidden');
		document.getElementById('popup_control_board').removeAttribute('hidden');
		document.getElementById('popup_control_board_title').innerHTML = title;
		document.getElementById('popup_control_board_content').innerHTML = content;
		return 0;
	};

	static ClosePopup(keypress = false) {
		// Only close if no actions are in progress...
		if (Action.Current != ActionState.None) Action.CancelAll();
		Active.CountryViewing = null; // Stores country that is being viewed in popup_control_board

		// Remove all clock intervals from window.data.popup_silo
		if (Active.SiloViewing != null) {
			window.data.popup_silo[Active.SiloViewing] = {};
			Active.SiloViewing = null; // Stores the silo that is being viewed in popup_control_board
		}
		Active.CityViewing = null; // Stores the city that is being viewed in popup_control_board

		document.getElementById('popup_control_board').setAttribute('hidden', 'hidden');
		document.getElementById('control_board').removeAttribute('hidden');
		document.getElementById('popup_control_board_title').innerHTML = '';
		document.getElementById('popup_control_board_content').innerHTML = '';

		// If on launch screen, view origin silo
		if (Active.PopupViewing == 'launch_seq') {
			if (Constants.TARGET.getElementById('weapon-radius') != null) Constants.TARGET.getElementById('weapon-radius').remove();
			if (!keypress) SiloEvents.ClickOn(Active.LaunchingFrom);
			Events.CleanActivity();
		} else if (Active.PopupViewing == 'defence_post') {
			if (!keypress) ControlBoardEvents.ClickDefencePosts();
			Events.CleanActivity();
		} else Active.PopupViewing = null;

		return 0;
	};

	// Click on 'Get an Ally'
	static ClickGetAlly() {
		Action.GetAlly();
		return 0;
	};

	// Click on 'Sever Ally'
	static ClickSeverAlly(cid) {
		Action.SeverAlly(cid);
		return 0;
	};

	// Click on 'view weapon specs'
	static ClickWeaponInfo() {
		Active.PopupViewing = 'weapon';
		ControlBoardEvents.OpenPopup('Weapon Specs', ControlBoard.WeaponSpecsMenu());
		return 0;
	};

	// Click on weapon in 'weapon specs' window
	static ClickWeaponSpecsFocused(weapon) {
		Active.PopupViewing = 'weapon_focused';
		ControlBoardEvents.OpenPopup(display(weapon), ControlBoard.WeaponSpecsFocused(weapon));
		return 0;
	};

	// Click on 'Back: country list'
	static ClickCountryList() {
		Active.PopupViewing = 'country_list';
		ControlBoardEvents.OpenPopup('Country List', ControlBoard.AllCountryList());
		return 0;
	};

	// Click on 'Details' for 'events'
	static ClickEventDetail() {
		Active.PopupViewing = 'events';
		ControlBoardEvents.OpenPopup('Events', ControlBoard.EventListDetail());
		return 0;
	};

	// Click on 'More' when viewing detailed evtn list
	static ClickEventFocused(eid) {
		Active.PopupViewing = 'event_focused';
		ControlBoardEvents.OpenPopup('Event ID ' + eid, ControlBoard.FocusedEventInfo(eid));
		return 0;
	};

	// Click on 'view defence posts'
	static ClickDefencePosts() {
		Active.PopupViewing = 'defence_posts';
		ControlBoardEvents.OpenPopup('Defence Posts', ControlBoard.DefencePostList());
		return 0;
	};

	// Detailed ally information
	static LoadAllies() {
		Active.PopupViewing = 'allies';
		ControlBoardEvents.OpenPopup('Allies', ControlBoard.AlliesDetail());
		return 0;
	};

	// Routinely increase money due to income
	static RoutineAddIncome() {
		if (!Constants.ADD_INCOME) return 0;
		window.data.me.money += window.data.me.income;
		ControlBoard.UpdateMoneyButtons();
		return 0;
	};

	// Set new income/update income
	static UpdateIncome() {
		window.data.me.income = 0;
		window.data.me.income += Calculations.GetHomeIncome();

		for (let ally of window.data.me.allies)
			window.data.me.income += Calculations.GetAllyIncome(ally);

		ControlBoard.Money();
		return window.data.me.income;
	};

	// In defence section of panel, click 'launch defence missile'
	static LaunchDefence() {
		let missiles = Map.GetSilosWith('defence');  // Get all silos that contain type=weapon
		let silo = randomChoice(Object.keys(missiles));		// Get a random silo

		Active.LaunchingFrom = parseInt(silo);
		Active.LaunchingType = 'defence_missile';
		Active.LaunchingFromDefence = true;

		// Pick target
		Action.WeaponPickTarget();
		return 0;
	};
}

// For handling window.data.events  (e.g. weapon launching...)
class Events {
	// Stores all events, as well as grouped by state
	static List = {};
	static Active = [];
	static Scheduled = [];

	// When, at first, game state is 'full', Events.Trigger()
	static StartupEventsTriggered = false;

	// Add event, take object (saves to events.json)
	static Add(auth, args) {
		if (istype(args, 'array') && args.length < 1) throw "ArgumentError: provided argument 'args', if array, msut be of length > 0";
		/*if (count > 1) {
			for (let i = 0; i < count; i += 1) {
				let object = JSON.parse(JSON.stringify(original_object));  // Copy object
				object.done = [false, false];  // Stores whether player_1 has done the event, and player_2 has done the event.
				object.id = parseInt(Time.AddBits(object.time, i) + ((new Date).getMilliseconds() * (rand(1, 100))).toString());
				object.time = Time.AddBits(object.time, i);
				//console.log(dump(object))
				window.data.events.push(object);
			}
		} else {
			original_object.done = [false, false];  // Stores whether player_1 has done the event, and player_2 has done the event.
			original_object.id = parseInt(Time.Now() + ((new Date).getMilliseconds() * (rand(1, 100))).toString());
			window.data.events.push(original_object);
		}*/
		if (istype(args, 'array')){
			for (let i = 0; i < args.length; i += 1) {
				args[i].done = [false, false];
				args[i].id = parseInt(Time.Now() + ((new Date).getMilliseconds() * (rand(1, 100))).toString());
				window.data.events.push(args[i]);
			}
		} else {
			args.done = [false, false];
			args.id = parseInt(Time.Now() + ((new Date).getMilliseconds() * (rand(1, 100))).toString());
			window.data.events.push(args);
		}
		Update.File(auth, 'events.json', window.data.events);
		Update.Add('events.json', [2]);
		return 0;
	};

	// Add event, take object (does not save to events.json)
	static AddMe(args) {
		if (istype(args, 'array') && args.length < 1) throw "ArgumentError: provided argument 'args', if array, msut be of length > 0";
		if (istype(args, 'array')){
			for (let i = 0; i < args.length; i += 1) {
				args[i].done = [false, false];
				args[i].id = parseInt(Time.Now() + ((new Date).getMilliseconds() * (rand(1, 100))).toString());
				window.data.events.push(args[i]);
			}
		} else {
			args.done = [false, false];
			args.id = parseInt(Time.Now() + ((new Date).getMilliseconds() * (rand(1, 100))).toString());
			window.data.events.push(args);
		}
		Events.Trigger();
		return 0;
	};

	// Look for events which haven't been initiated into a GameEvent class
	static Trigger() {
		// For the events where their ID is NOT in Events.List
		let triggered = 0;
		for (let i = 0; i < window.data.events.length; i += 1) {
			let di = (window.me == 'player_1' ? 0 : 1);
			if (Events.List[window.data.events[i].id] == null && window.data.events[i].done[di] == false) {
				// Kick off new GameEvent. The class will handle the rest =) INCLUDING adding event to Events.List
				new GameEvent(window.data.events[i]);
				triggered += 1;
			}
		}
		return triggered;
	};

	// 'Clean' activity
	static CleanActivity() {
		Active.LaunchingFrom = null;
		Active.LaunchingType = null;
		Active.LaunchingCount = null;
		Active.LaunchingFromDefence = false;
		Active.TargetEvent = null;
		return 0;
	};

	// If line (launch path) extends past the target
	static LineExtendsPast(klass) {
		let coords = [...klass.coords];
		let target = [...klass.target_coords];

		switch (klass.dir) {
			case 'DR':
				return (coords[0] >= target[0] || coords[1] >= target[1]);
			case 'UL':
				return (coords[0] <= target[0] || coords[1] <= target[1]);
			case 'DL':
				return (coords[0] <= target[0] || coords[1] >= target[1]);
			case 'UR':
				return (coords[0] >= target[0] || coords[1] <= target[1]);
		};
	};

	// Get waiting events inside a given silo
	static GetEventsInSilo(silo) {
		let events = [];
		for (let eid in Events.List)
			if (Events.List[eid].from_user == window.me && Events.List[eid].from_silo == silo)
				events.push(eid);
		return events;
	};

	// Get a random event
	// type (array) -> what type should the event be?
	static GetRandom(user = null, type = null) {
		let events = [];
		for (let eid of Events.Active)
			if ((user == null || Events.List[eid].from_user == user) && (dump(type, true) != 'array' || type.length < 1 || type.indexOf(Events.List[eid].type) !== -1))
				events.push(eid);
		return (events.length > 0 ? randomChoice(events) : null);
	};
}

class GameEventStates {
	static Scheduled = 0;
	static Active = 1;
};
// Class for holding events (e.g. weapon)
class GameEvent {
	constructor(object) {
		for (let prop in object)
			this[prop] = object[prop];

		this.Init();
		this.interval_id = setInterval(this.Wait.bind(this), window.gamevars.event_wait_time);	// So we can terminate the interval later
	};

	// Initiate info
	Init() {
		// Mark as done
		this.MarkAsDone();

		// Add to object which stores all active events
		Events.List[this.id] = this;
		Events.Scheduled.push(this.id);
		this.state = GameEventStates.Scheduled;
		if (this.from_user == window.me) ControlBoard.EventListOverview(); // Show on control board
		if (Active.PopupViewing == 'events') ControlBoardEvents.ClickEventDetail();

		this.percent_done = 0;

		switch (this.type) {
			case 'weapon':
			case 'defence':
				if (this.from_user == window.me && Active.SiloViewing == this.from_silo)
					SiloEvents.ClickOn(this.from_silo);
				// Show destination
				if (this.from_user == window.me)
					Constants.TARGET.appendChild(create_svg_element('circle', {
						cx: this.target_coords[0],
						cy: this.target_coords[1],
						r: Constants.TARGET_RADIUS,
						stroke: 'none',
						fill: window.data.me.weapon_colour,
						id: 'event-weapon-target-' + this.id
					}));

				// Stores current pos of weapon
				this.coords = [...this.from_coords];
				/*
					   /|
				   d  /	|  dy
					/___|
					  dx
				 */
				this.dx = this.target_coords[0] - this.coords[0];	// distance x
				this.dy = this.target_coords[1] - this.coords[1];	// distance y
				this.d = Math.sqrt((this.dx*this.dx) + (this.dy*this.dy));	// distance along slope (pythag)
				if (isNaN(this.d)) {
					throw "EventError: d is NaN: Math.sqrt((" + this.dx + "*" + this.dx + ") + (" + this.dy + "*" + this.dy + "))";
					return 0;
				}

				// Find  which dir the weapon is travelling
				if (this.dx >= 0 && this.dy >= 0)
					this.dir = 'DR'; // Down-right
				else if (this.dy < 0 && this.dx < 0)
					this.dir = 'UL'; // Up-left
				else if (this.dx < 0 && this.dy >= 0)
					this.dir = 'DL'; // Down-left
				else if (this.dx >= 0 && this.dy < 0)
					this.dir = 'UR'; // Up-right

				// Find movement (m) per second on both axis
				this.m = (this.type == 'weapon' ? window.weapons[this.weapon].speed : window.defences[this.weapon].speed);
				let time = this.d / (this.m * (window.gamevars.event_weapon_action_time / 1000));	// movement is per second, so divide by window.gamevars.event_weapon_action_time
				this.mx = this.dx / time;
				this.my = this.dy / time;

				// Record how far was moved
				this.mvdx = 0;
				this.mvdy = 0;
				this.mvd = 0;

				if (this.type == 'defence') this.destroyed_enemies = false;		// Did defence missile hit and explode enemy missiles, or did it explode uselessly at target?
				break;
		}
		return 0;
	};

	// While missile is waiting...
	Wait() {
		// Check if time has past
		if (parseInt(this.time) <= parseInt(Time.Now())) {
			clearInterval(this.interval_id); // Clear interval for Wait()
			this.state = GameEventStates.Active;
			array_remove(this.id, Events.Scheduled);
			Events.Active.push(this.id);
			if (this.from_user == window.me) ControlBoard.EventListOverview(); // Show on control board

			switch (this.type) {
				case 'weapon':
				case 'defence':
					Sounds.Play('launch');

					// If clock exists...
					if (document.getElementById('silo-clock-' + this.id) != null) {
						document.getElementById('silo-clock-' + this.id).innerText = Constants.WEAPON_LAUNCHED_TEXT;
						document.getElementById('silo-clock-' + this.id).classList.add('done');
					}
					break;
			}

			// Set action
			let time = ((this.type == 'weapon' || this.type == 'defence') ? window.gamevars.event_weapon_action_time : window.gamevars.event_action_time);
			this.interval_id = setInterval(this.Action.bind(this), time);
			// ^^ The scope of 'this' would change in setInterval to window. bind() makes sure the current scope of 'this' (i.e. THIS class instance) remains
		}
		return 0;
	};

	// Action
	Action() {
		switch (this.type) {
			case 'weapon':
			case 'defence':
				if (Constants.TARGET.getElementById('event-line-' + this.id) != null) Constants.TARGET.getElementById('event-line-' + this.id).remove();

				this.coords = [this.coords[0] + this.mx, this.coords[1] + this.my];
				this.mvdx += this.mx;
				this.mvdy += this.my;
				this.mvd = Math.sqrt((this.mvdx * this.mvdx) + (this.mvdy * this.mvdy));
				this.percent_done = (this.mvd / this.d) * 100;

				let el = create_svg_element('line', {
					x1: this.from_coords[0],
					y1: this.from_coords[1],
					x2: this.coords[0],
					y2: this.coords[1],
					stroke: window.data.vars[this.from_user].weapon_colour,
					//'stroke-dasharray': '2 5',
					'stroke-width' : 2,
					fill: 'none',
					'line-cap': 'round',
					id: 'event-line-' + this.id
				});
				Constants.TARGET.appendChild(el);

				// Show percentage of journey on clock
				if (document.getElementById('silo-clock-' + this.id) != null) document.getElementById('silo-clock-' + this.id).innerText = Math.round(this.percent_done) + '%';

				// Check if line extends past the target_coords
				if (Events.LineExtendsPast(this)) this.Finished();

				// If advanced defence missile, check if any weapons in radius, and blow up if so
				if (this.weapon == 'adv_defence_missile') {
					let events = Map.GetEventsInRange(this.coords[0], this.coords[1], window.defences[this.weapon].influence_radius, this.target_user); // this.target_user stores the 'enemy' of the defence missile
					if (events.length > 0) {
						this.destroyed_enemies = true;
						let msg = '<u>' + display(this.from_user) + '\' ' + display(this.weapon) + ' exploded on enemy intersection, destroying...</u>';
						let hit = [];
						for (let event of events)
							hit.push(display(Events.List[event].from_user) + '\'s ' + display(Events.List[event].weapon) + ' <small>targeted at</small> ' + (Events.List[event].target_country == 'sea' ? 'the ocean' : '<img class="flag_ref" src="' + Map.GetFlagURL(Events.List[event].target_country) + '" /> ' + getCountryName(Events.List[event].target_country)));
						ControlBoard.ShowMsg('<span style="color: ' + window.data.vars[this.from_user].colour + '">' + msg + '<br>' + hit.join('<br>') + '</span>', null, true);

						Action.DestroyEvents(events, true);
						if (Active.SiloViewing == this.from_silo) SiloEvents.ClickOn(this.from_silo);
						this.Finished();
					}
				}

				// If MIRV; check distance. If over x% of the way, split.
				else if (this.weapon == 'mirv') {
					// Get 'split' percent of the distance. If current distance if over that, split.
					if (this.percent_done >= window.weapons.mirv.split_percent) {
						let children = [];
						for (let i = 0; i < window.weapons.mirv.children_no; i += 1) {
							let from_coords = [this.coords[0] + rand(-20, 20), this.coords[1] + rand(-20, 20)];
							let child = {
								type: this.type,
								weapon: 'mirv_child',
								mirv_parent: this.id,
								target_type: this.target_type,
								target_country: this.target_country,
								target_coords: [...this.target_coords],
								target_user: this.target_user,
								from_country: this.from_country,
								from_user: this.from_user,
								from_silo: this.from_silo,
								from_coords: from_coords,
								time: this.time
							};
							children.push(child);
						}
						Events.AddMe(children);
						this.Delete();
					}
				}
				break;
			default:
				throw 'EventError: Action(): type is unrecognised (no related event handler for \'' + this.type + '\')';
		}
		return 0;
	};

	// When event is finished
	Finished() {
		clearInterval(this.interval_id);
		// Remove from Events.List
		delete Events.List[this.id];
		array_remove(this.id, Events.Active);

		if (this.from_user == window.me) ControlBoard.EventListOverview();
		if (Active.PopupViewing == 'events') ControlBoardEvents.ClickEventDetail();

		// Remove from our window.data.events
		for (let i = 0; i < window.data.events.length; i += 1) {
			if (window.data.events[i].id == this.id) {
				window.data.events.splice(i, 1);
				break;
			}
		}
		if (document.getElementById('silo-clock-' + this.id) != null) document.getElementById('silo-clock-' + this.id).remove();

		switch (this.type) {
			case 'weapon':
				if (Constants.TARGET.getElementById('event-line-' + this.id) != null) Constants.TARGET.getElementById('event-line-' + this.id).remove();
				if (this.from_user == window.me && Constants.TARGET.getElementById('event-weapon-target-' + this.id) != null)
					Constants.TARGET.getElementById('event-weapon-target-' + this.id).remove();
				if (this.from_user == window.me && Active.SiloViewing == this.from_silo)
					SiloEvents.ClickOn(this.from_silo);
				Action.WeaponLand(this);
				break;
			case 'defence':
				if (Constants.TARGET.getElementById('event-line-' + this.id) != null) Constants.TARGET.getElementById('event-line-' + this.id).remove();
				if (this.from_user == window.me && Constants.TARGET.getElementById('event-weapon-target-' + this.id) != null)
					Constants.TARGET.getElementById('event-weapon-target-' + this.id).remove();

				// If ordinary defence, check for events in radius to see if we got any destroyed
				let events = Map.GetEventsInRange(this.target_coords[0], this.target_coords[1], window.defences[this.weapon].influence_radius, this.target_user); // this.target_user stores the 'enemy' of the defence missile
				if (events.length > 0) {
					this.destroyed_enemies = true;
					let msg = '<u>' + display(this.from_user) + '\' ' + display(this.weapon) + ' exploded on enemy intersection, destroying...</u>';
					let hit = [];
					for (let event of events)
						hit.push(display(Events.List[event].from_user) + '\'s ' + display(Events.List[event].weapon) + ' <small>targeted at</small> ' + (Events.List[event].target_country == 'sea' ? 'the ocean' : '<img class="flag_ref" src="' + Map.GetFlagURL(Events.List[event].target_country) + '" /> ' + getCountryName(Events.List[event].target_country)));
					ControlBoard.ShowMsg('<span style="color: ' + window.data.vars[this.from_user].colour + '">' + msg + '<br>' + hit.join('<br>') + '</span>', null, true);

					Action.DestroyEvents(events, true);
					if (Active.SiloViewing == this.from_silo) SiloEvents.ClickOn(this.from_silo);
				}

				if (!this.destroyed_enemies) ControlBoard.ShowMsg('<u>' + display(this.from_user) + '\'s ' + display(this.weapon) + '</u><br><small>Exploded on target, not hitting any enemy missiles.<br>The only thing it did succesfully was add to pollution levels! Boo.</small>', null, true)
				Map.PulseExplosion(this.coords, window.defences[this.weapon].radius);
				Sounds.Play('explosion_dm');
				if (Active.SiloViewing == this.from_silo) SiloEvents.ClickOn(this.from_silo);
				break;
			default:
				throw 'EventError: Finished(): type is unrecognised (no related event terminator for \'' + this.type + '\')';
		}
		return 0;
	};

	// Like FInished, but called from outside. Completely stops event. like it never existed
	Delete() {
		clearInterval(this.interval_id);

		// Remove from Events.List
		array_remove(this.id, Events.Scheduled);
		array_remove(this.id, Events.Active);
		delete Events.List[this.id];

		// Remove from our window.data.events
		for (let i = 0; i < window.data.events.length; i += 1) {
			if (window.data.events[i].id == this.id) {
				window.data.events.splice(i, 1);
				break;
			}
		}

		switch (this.type) {
			case 'weapon':
			case 'defence':
				if (Constants.TARGET.getElementById('event-line-' + this.id) != null) Constants.TARGET.getElementById('event-line-' + this.id).remove();
				if (this.from_user == window.me && Constants.TARGET.getElementById('event-weapon-target-' + this.id) != null)
					Constants.TARGET.getElementById('event-weapon-target-' + this.id).remove();
				if (document.getElementById('silo-clock-' + this.id) != null) document.getElementById('silo-clock-' + this.id).remove();
				break;
			default:
				throw 'EventError: Delete(): type is unrecognised (no related event terminator for \'' + this.type + '\')';
		}

		return 0;
	};

	// Mark event as done in events.json
	MarkAsDone() {
		let http = new XMLHttpRequest();
		let id = this.id;
		http.open('POST', 'xmlhttp/event_done.php?auth=' + Constants.AUTH + '&player=' + window.me + '&eventID=' + this.id);
		http.onload = function() {
			console.log('%c[!] Marked event #' + id + ' as done for our end', 'color:orange;');
		};
		http.send();
	};
}
