class Update {
	// Game cycle; check for updates, as well as game state
	static RoutineCheck(pause_only = false) {
		let http = new XMLHttpRequest();
		http.open('GET', 'xmlhttp/get_check.php');
		http.onload = function() {
			if (http.response == 'E_404') {
				console.error('Cannot check updates: file does not exist: E_404');
				return 0;
			}
			let update = JSON.parse(http.response);

			window.data.state = update[0];
			Update.GameState(update[0]);

			if (update[2] != undefined && Constants.DO_FOCUS_NEEDED) {
				// Check if paused
				if (update[2].player_1 || update[2].player_2) {
					// Pause stuff
					document.getElementById('_main_').setAttribute('hidden', true);
					document.getElementById('_paused_').removeAttribute('hidden');
					document.getElementById('paused_player').innerHTML = (update[2][window.me] == true ? '<img class="flag_med" src="flags/' + window.data.me.region + '.svg" /> you are' : '<img class="flag_med" src="flags/' + window.data.enemy.region + '.svg" /> ' + display(window.enemy) + ' is');
					window.isPaused = true;
				} else if (!update[2].player_1 && !update[2].player_2) {
					// Un-Pause stuff
					document.getElementById('_main_').removeAttribute('hidden');
					document.getElementById('_paused_').setAttribute('hidden', true);
					document.getElementById('paused_player').innerHTML = '';
					window.isPaused = false;
				}
				if (pause_only) return 0;
			}

			// Only do updates if state is full
			if (update[0] == 'full') {
				update = update[1];
				for (let file in update) {
					if (update[file][window.me] === false) {
						console.log("%c[.] Updating file " + file + " (flags: " + update[file].exec.join(', ') + ") ...", "color:magenta;");

						let callbacks = [];
						if (update[file].exec.length > 0) {
							for (let code of update[file].exec) {
								switch (code) {
									case '1':
										// Update Allies
										callbacks.push(Map.AlliesChanged);
										break;
									case '2':
										// Update events
										callbacks.push(Events.Trigger);
										break;
									case '3':
										// Update Silos
										callbacks.push(Map.SilosChanged);
										break;
									case '4':
										// Update message in #info_message
										callbacks.push(ControlBoard.ShowMsgFromHistory);
										break;
								}
							}
						}

						Update.Data(file, callbacks);
						Update.MarkAsDone(file);
					}
				}
			}
		}
		http.send();
	};

	// Fetch data from file
	static Data(file, callbacks = []) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', 'xmlhttp/get_file.php?file=' + file);
		xhr.onload = function() {
			if (xhr.response == 'E_404') {
				console.error("Cannot fetch file " + file + " : E_404");
			} else {
				switch (file) {
					case 'defence_posts.json':
						window.data.defence_posts = JSON.parse(xhr.response);
						break;
					case 'events.json':
						window.data.events = JSON.parse(xhr.response);
						break;
					case 'msg_history.txt':
						window.data.message_old = xhr.response;
						break;
					case 'ru_cities.json':
						window.data.cities.ru = JSON.parse(xhr.response);
						break;
					case 'silos.json':
						window.data.silos = JSON.parse(xhr.response);
						break;
					case 'us_cities.json':
						window.data.cities.us = JSON.parse(xhr.response);
						break;
					case 'vars.json':
						window.data.vars = JSON.parse(xhr.response);
						window.data.me = window.data.vars[window.me];
						window.data.enemy = window.data.vars[window.enemy];
						break;
					case 'weapons.json':
						window.data.weapons = JSON.parse(xhr.response);
						break;
					default:
						throw "ArgumentError: Unrecognised file entry '" + file + "' (switch in Update.Data)";
				}
				console.log("%c[...] Fetched file " + file, "color:purple;");

				// Execute all callback functions in callbacks[]
				for (let callback of callbacks)
					if (typeof callback == 'function')
						callback();
			}
		}
		xhr.send();
	};

	// Save data to file
	static File(auth, file, data) {
		if (typeof data != 'string')
			data = JSON.stringify(data);

		let xhr = new XMLHttpRequest();
		xhr.open('POST', 'xmlhttp/save_file.php');
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		xhr.onload = function() {
			switch (xhr.response) {
				case 'E_404':
					console.error("Update.File: Cannot find file " + file + " : E_404 (sender '" + window.me +"')");
					break;
				case 'E_401':
					console.error("Authentication code is incorrect : " + auth);
					break;
				case 'E_400':
					console.error("Cannot save to file " + file + " : E_400 (malformed data)");
					break;
				default:
					console.log("%c[**] Saved file " + file, "color:lime;");
			}
		}
		xhr.send('auth=' + auth + '&file=' + file + '&data=' + data + '&from=' + window.me);
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
				window.location.href = 'index.php?msg=1';
				break;
			case 'gone':
				// Game has been deleted
				window.onbeforeunload = undefined;
				window.location.href = 'index.php?error=2&gid=' + window.id;
				break;
			case 'locked':
				window.onbeforeunload = undefined;
				window.location.href = 'index.php?error=5&gid=' + window.id;
				break;
		}
	};

	// Add update - add to update.json (flag to update the file)
	static Add(file, execCodes = []) {
		let http = new XMLHttpRequest();
		http.open('GET', 'xmlhttp/add_update.php?file=' + file + '&execcodes=' + execCodes.join(',') + '&from=' + window.me);
		http.onload = function() {
			if (http.response == 'E_404_1')
				console.error('Cannot add update flag: file to update "' + file + '" does not exist (E_404)');
			else if (http.response == 'E_404_2')
				console.error('Cannot add update flag: player to update does not exist: "' + window.me + '" (E_404)');
			else
				console.log("%c[*] Added update flag for " + file, "color:green;");
		}
		http.send();
	};

	// Mark update for file as 'true' for player
	static MarkAsDone(file) {
		let http = new XMLHttpRequest();
		http.open('GET', 'xmlhttp/done_update.php?file=' + file + '&player=' + window.me);
		http.onload = function() {
			if (http.response == 'E_404')
				console.error('Cannot mark flag as done: file to mark "' + file + '" does not exist (E_404)');
			else {
				console.log("%c[!] Marked flag as done for " + file, "color:orange;");
				if (http.response == 'Removed')
					console.log("%c[x] Removed update flag for " + file, "color:tomato;");
			}
		}
		http.send();
	};

	// Reload window.data.popup_silo
	static PopupSiloData() {
		window.data.popup_silo = {};
		for (let i = 0; i < window.data.silos[window.me].length; i += 1)
			window.data.popup_silo[i] = [];
		return 0;
	};

	// Save message history
	static SaveMessageHistory(sync = false) {
		let text = document.getElementById('info_message').innerHTML;
		let http = new XMLHttpRequest();
		http.open('POST', 'xmlhttp/msg_history.php');
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		http.onload = function() {
			if (sync) Update.Add('msg_history.txt', [4]);
		}
		http.send('text=' + htmlToText(text));
	};

	// Check if page has focus
	static CheckFocus() {
		if (window.isAdmin) {
			document.getElementById('doc_focus_now').innerText = dump(document.hasFocus());
			document.getElementById('doc_focus_was').innerText = dump(Active.HadFocus);
		}

		if (document.hasFocus()) {
			if (!Active.HadFocus || Active.HadFocus == null) {
				// document.body.style.background = '#4d44';
				Active.HadFocus = true;
				Update.Pause(window.me, false);
			}
		} else {
			if (Active.HadFocus || Active.HadFocus == null) {
				// document.body.style.background = '#d444';
				Active.HadFocus = false;
				Update.Pause(window.me, true);
			}
		}
	};

	// Update paused flag for user
	static Pause(player, paused = true) {
		let http = new XMLHttpRequest();
		http.open('GET', 'xmlhttp/pause.php?user=' + player + '&paused=' + paused);
		http.onload = function() {
			console.log('Pause: ' + dump(http.response))
		};
		http.send();
	};

	// Save EVERYTHING
	static UniversalSave() {
		Update.File(Constants.AUTH, 'vars.json', window.data.vars);
		if (window.isAdmin) Update.SaveMessageHistory();

		return 0;
	};
}
