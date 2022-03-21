class Update {
	static Init() {
		socket.on("handle-update", ({ file, fileData, execCodes }) => {
			// Update data
			switch (file) {
				case 'defence_posts.json':
					window.data.defence_posts = fileData;
					break;
				case 'events.json':
					window.data.events = fileData;
					break;
				case 'msg_history.txt':
					window.data.message_old = fileData;
					break;
				case 'ru_cities.json':
					window.data.cities.ru = fileData;
					break;
				case 'silos.json':
					window.data.silos = fileData;
					break;
				case 'us_cities.json':
					window.data.cities.us = fileData;
					break;
				case 'vars.json':
					window.data.vars = fileData;
					window.data.me = window.data.vars[window.me];
					window.data.enemy = window.data.vars[window.enemy];
					break;
				case 'weapons.json':
					window.data.weapons = fileData;
					break;
				default:
					throw "ArgumentError: Unrecognised file entry '" + file + "' (switch in Update.Data)";
			}

			// Functions
			execCodes.forEach(code => {
				switch (+code) {
					case 1:
						// Update Allies
						Map.AlliesChanged();
						break;
					case 2:
						// Update events
						Events.Trigger();
						break;
					case 3:
						// Update Silos
						Map.SilosChanged();
						break;
					case 4:
						// Update message in #info_message
						ControlBoard.ShowMsgFromHistory();
						break;
				}
			});
		});

		// Pause?
		socket.on("pause", ({ player_1, player_2 }) => {
			if (Constants.DO_FOCUS_NEEDED) {
				// Check if paused
				if (player_1 || player_2) {
					// Pause stuff
					document.getElementById('_main_').setAttribute('hidden', true);
					document.getElementById('_paused_').removeAttribute('hidden');
					document.getElementById('paused_player').innerHTML = ((window.isAdmin ? player_1 : player_2) ? '<img class="flag_med" src="flags/' + window.data.me.region + '.svg" /> you are' : '<img class="flag_med" src="flags/' + window.data.enemy.region + '.svg" /> ' + display(window.enemy) + ' is');
					window.isPaused = true;
				} else if (!player_1 && !player_2) {
					// Un-Pause stuff
					document.getElementById('_main_').removeAttribute('hidden');
					document.getElementById('_paused_').setAttribute('hidden', true);
					document.getElementById('paused_player').innerHTML = '';
					window.isPaused = false;
				}
			}
		});

		// Update state
		socket.on("game-state", state => {
			window.data.state = state;
			Update.GameState(state);
		});
	}

	// Save data to file
	static File(auth, file, data) {
		socket.emit("update-data", { file, data });
	}

	// Check game state, and act accordingly
	static GameState(state) {
		switch (state) {
			case 'full':
				if (window.data.lastState == 'full') break;
				if (!Events.StartupEventsTriggered) {
					Events.Trigger();		// If this is the first time, trigger events
					ControlBoard.EventListOverview();
					Events.StartupEventsTriggered = true;
				}
				document.getElementById('_main_').removeAttribute('hidden');
				document.getElementById('_wait_').setAttribute('hidden', 'hidden');
				document.title = 'MAD Missile Destruction: ' + window.data.vars.general.name;
				break;
			case 'open':
				if (window.data.lastState == 'open' || window.data.vars.winner != null) break;
				document.getElementById('_main_').setAttribute('hidden', 'hidden');
				document.getElementById('_wait_').removeAttribute('hidden');
				document.title = 'MAD Missile Destruction: ' + window.data.vars.general.name + ' (waiting...)';
				break;
			case 'closed':
				if (window.data.vars.winner != null) break;
				window.onbeforeunload = undefined;
				window.location.href = '/menu.html?' + token + '&closed';
				break;
			case 'gone':
				// Game has been deleted
				window.onbeforeunload = undefined;
				window.location.href = '/menu.html?' + token + '&gone';
				break;
			case 'locked':
				window.onbeforeunload = undefined;
				window.location.href = '/menu.html?' + token + '&locked';
				break;
		}
	}

	// Add update - add to update.json (flag to update the file)
	static Add(file, execCodes = []) {
		socket.emit("add-update", { file, execCodes });
	}

	// Reload window.data.popup_silo
	static PopupSiloData() {
		window.data.popup_silo = {};
		for (let i = 0; i < window.data.silos[window.me].length; i += 1)
			window.data.popup_silo[i] = [];
		return 0;
	}

	// Save message history
	static SaveMessageHistory(sync = false) {
		let html = document.getElementById('info_message').innerHTML;
		socket.emit("save-msgs", { text: htmlToText(html), sync });
	}

	// Check if page has focus
	static HandleFocusChange(hasFocus) {
		if (window.isAdmin) {
			document.getElementById('doc_focus_now').innerText = dump(hasFocus);
			document.getElementById('doc_focus_was').innerText = dump(Active.HadFocus);
		}

		if (hasFocus) {
			if (!Active.HadFocus || Active.HadFocus == null) {
				// document.body.style.background = '#4d44';
				Active.HadFocus = true;
				Update.Pause(false);
			}
		} else {
			if (Active.HadFocus || Active.HadFocus == null) {
				// document.body.style.background = '#d444';
				Active.HadFocus = false;
				Update.Pause(true);
			}
		}
	}

	// Update paused flag for user
	static Pause(paused = true) {
		socket.emit("pause", paused);
	}

	// Save EVERYTHING
	static UniversalSave() {
		Update.File(Constants.AUTH, 'vars.json', window.data.vars);
		if (window.isAdmin) Update.SaveMessageHistory();
		return 0;
	}
}
