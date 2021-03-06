<?php
	/*!
		Player 1 -> admin
		Player 2 -> other
	*/
	session_start();

	if ((int)$_SESSION['missile_game_active'] < 1 || (int)$_SESSION['missile_game_active'] >= time()):
		die(header('Location: index.php?error=1&gid='.$GID));
	endif;

	$GID = $_SESSION['missile_game_active'];

	// Test if game exists
	$games = glob("games/*");
	if (!in_array("games/$GID", $games)):
		die(header('Location: index.php?error=2&gid='.$GID));
	endif;

	$state = file_get_contents("games/$GID/state.txt");

	// If game state is 'closed' and user isn't game admin, kick them
	if ($state == 'closed' && $_SESSION['missile_game_is_admin'] !== true):
		die(header('Location: index.php?error=3&gid='.$GID));
	endif;

	// If is_admin is not true, set it to false
	if ($_SESSION['missile_game_is_admin'] !== true) $_SESSION['missile_game_is_admin'] = false;

	// If game is full and this person is not the multiplayer guy, and the person is not the game admin
	if ($state == 'full' && $_SESSION['missile_game_other_player'] !== true && $_SESSION['missile_game_is_admin'] !== true):
		die(header('Location: index.php?error=4&gid='.$GID));
	endif;

	// If missile_game_other_player is not true, set it to false
	if ($_SESSION['missile_game_other_player'] !== true) $_SESSION['missile_game_other_player'] = false;

	function removeNewLines($string) {
		$string = preg_replace("/\n|\r|\r\n/", "", $string);
		$string = preg_replace("/\s{1,}/", "", $string);
		return $string;
	}
	function decode($string) {
		$string = json_decode($string);
		if (gettype($string) == 'string'):
			$string = json_decode($string);
		endif;
		return $string;
	}

	$info = decode(file_get_contents("games/$GID/vars.json"));

	$flag_p1 = 'flags/' . $info -> player_1 -> region . '.svg';
	$flag_p2 = 'flags/' . $info -> player_2 -> region . '.svg';

	$country = ($_SESSION['missile_game_is_admin'] === true ? $info -> player_1 -> region : $info -> player_2 -> region);
?>
<html lang="en" dir="ltr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>MAD Missile Destruction: <?php echo $info->general->name; ?></title>
		<link rel='stylesheet' href='styles/gamestyle.css' />
		<link rel="shortcut icon" href="<?php echo ($_SESSION['missile_game_is_admin'] === true ? $flag_p1 : $flag_p2); ?>"  />

		<?php if ($_SESSION['missile_game_is_admin'] === true): ?>
		<!-- Visual error handling -->
		<script type='text/javascript' charset='utf-8'>
			window.onerror = function(msg, src, line, col, error) {
				document.getElementById('wn_error').setAttribute('style', 'color:crimson;font-family:\'Courier New\';background:#D227;padding:3px;');
				document.getElementById('wn_error').innerHTML += '<b style="font-size:1.2em;">' + error + '</b><br>@ ' + src + ':' + line + ':' + col + '<br><br>';
			}
		</script>
		<?php endif; ?>

		<script type="text/javascript" charset="utf-8" src="data/gamedata.js"></script>
		<script type="text/javascript" charset="utf-8" src="data/countries.js"></script>
	</head>

	<body>
		<div id="_outer_content">
			<div id='_content'>
				<main id="_main_">
					<table>
						<tr>
							<td>
								<table id="top_info">
									<tr>
										<td>
											<center>
												<table id="enemy_summary" class='header_info'>
													<tr>
														<th>Enemy: </th>
														<td><img class='flag_title' src='<?php echo ($_SESSION['missile_game_is_admin'] === true ? $flag_p2 : $flag_p1); ?>' title='<?php echo ($_SESSION['missile_game_is_admin'] === true ? 'Player 2' : 'Player 1'); ?>' /></td>
													</tr>
													<tr>
														<th>Health</th>
														<td id="enemy_health"></td>
													</tr>
												</table>
											</center>
										</td>
										<!-- Header: message box [ControlBoard.ShowMsg(msg, ?time)] -->
										<td>
											<div class='header_info info_map_hover_content' id='info_message'></div>
										</td>
										<!-- Header: country info container -->
										<td>
											<div class='header_info' id='info_country_hover'></div>
										</td>
										<!-- Header: map-hover info container -->
										<td>
											<div class='header_info' id='info_map_hover'></div>
										</td>
									</tr>
								</table>
							</td>
							<td rowspan='2'>
								<div id="control_board">
									<!-- Big Flag -->
									<center>
										<img id='control_board_flag' class='flag_title' src='<?php echo ($_SESSION['missile_game_is_admin'] === true ? $flag_p1 : $flag_p2); ?>' />
									</center>

									<div id="control_board_content">
										<!-- General Info -->
										<fieldset>
											<legend>General</legend>
											<table>
												<tbody>
													<tr>
														<th><abbr title="Population">Pop.:</abbr> </th>
														<td><small id='info_population'></small></td>
													</tr>
													<tr>
														<th>Casualties: </th>
														<td id='info_casualties'></td>
													</tr>
													<tr>
														<th>Health: </th>
														<td><meter id='info_health_meter' min='0' low='30' high='75' optimum='90' max='100' /></td>
													</tr>
												</tbody>
											</table>
										</fieldset>
										<br>

										<!-- Ecenomical Info -->
										<fieldset>
											<legend>Economy</legend>
											<table>
												<tbody>
													<tr>
														<th>Budget:</th>
														<td><small id="info_money"></small></td>
													</tr>
													<tr>
														<th>Income:</th>
														<td id="info_income"></td>
													</tr>
												</tbody>
											</table>
										</fieldset>
										<br>

										<!-- Defence Info -->
										<fieldset>
											<legend>Defence</legend>
											<center>
												<table>
													<tr>
														<td id='launch_defence_missile'></td>
													</tr>
												</table>
											</center>
										</fieldset>
										<br>

										<!-- Silo Info -->
										<fieldset>
											<legend>Silos</legend>
											<center>
												<span id='info_silos'></span>
											</center>
										</fieldset>
										<br>

										<!-- Ally Info -->
										<fieldset>
											<legend>Allies</legend>
											<center>
												<span id='info_allies'></span>
											</center>
										</fieldset>
										<br>

										<!-- Event Info -->
										<fieldset>
											<legend>Events</legend>
											<center>
												<span id='info_events'></span>
											</center>
										</fieldset>
									</div>

								</div>

								<!-- Popup board -->
								<div id="popup_control_board" hidden='hidden'>
									<span class='close_btn' style='float: right;' onclick='ControlBoardEvents.ClosePopup()'><big>&times;</big></span>
									<br>
									<center>
										<span id='popup_control_board_title'></span>
										<br><br>
										<div id='popup_control_board_content'></div>
									</center>
								</div>
							</td>
						</tr>
						<tr>
							<td>
								<!---  MAP ------------------------------------------------------->
								<div id="map_div">
									<!-- ID: 'map' -->
									<?php echo file_get_contents('data/svg_map.svg'); ?>
								</div>
							</td>
						</tr>
					</table>
				</main>
				<section id="_wait_" hidden='hidden'>
					<big>Cannot start until another player joins...
					<br>Join code: <code><?php echo $info -> general -> join_code; ?></code></big>
					<br><br>
					<div class="wait"></div>
					<br /><br />
				</section>
				<section id="_paused_" hidden='hidden'>
					<big>Game paused</big>
					<p>Game will resume when <span id='paused_player'></span> active on the game window</p>
					<br><br>
					<div class="wait"></div>
					<br /><br />
				</section>

				<!-- 'Menu' -->
				<div>
					<button class="btn_red" onclick="window.location.href = 'files/leavegame.php?gid=<?php echo $GID; ?>&jc=<?php echo $info->general->join_code; ?>';" id="btn_leave_game">Leave Game</button>
					<?php if ($_SESSION['missile_game_is_admin']): ?>
					<button class="btn_red" onclick="if (window.confirm('Delete Game `<?php echo $info->general->name; ?>` ?')) window.location.href = 'files/_delete_.php?gid=<?php echo $info->general->id; ?>&auth=2e4ri1kxb'">Delete Game</button>
					<button class="btn_red" onclick="document.getElementById('info_message').innerHTML = ''; Update.SaveMessageHistory(true);">Clear Msg History</button>
					<?php endif; ?>
					<button id="btn_cancel_all_actions" class="btn_blue" onclick="Action.CancelAll()">Cancel ALL Actions</button>
					&nbsp;&nbsp; | &nbsp;&nbsp;
					<small>
						<a href="javascript:void(0)" onclick="ControlBoardEvents.ClickCountryList()">List of Countries</a>
						&nbsp;&nbsp; | &nbsp;&nbsp;
						<a href="javascript:void(0)" onclick="ControlBoardEvents.ClickWeaponInfo()">Weapon Stats</a>
						&nbsp;&nbsp; | &nbsp;&nbsp;
					</small>
					<span class='clock big' id="main_time"><?php echo date('h:i:s'); ?></span>
				</div>

				<!-- Admin statistics -->
				<?php if ($_SESSION['missile_game_is_admin'] === true): ?>
					<br>
					<fieldset>
						<legend>Administrator Panel</legend>
						<table border='1' style='border-collapse: collapse;'>
							<tr>
								<td colspan='8'>
									<div id='wn_error'></div>
								</td>
							</tr>
							<tr>
								<th>Mouse Pos: </th>
								<td><code id="coords">(-, -)</code></td>

								<th>Active Popup</th>
								<td><code id='active_popup'></code></td>

								<th>JS Heap Size: </th>
								<td><code id='win_size'>?</code></td>

								<th>Connection: </th>
								<td><code id='connect_speed'>?</code></td>

								<th>Is Focused: </th>
								<td><code id='doc_focus_now'>?</code></td>
							</tr>
							<tr>
								<th>Mouse Pos (rel to map): </th>
								<td><code id="coords_map">(-, -)</code></td>

								<th>Action: </th>
								<td><code id="action_current">(not updated)</code></td>

								<th>Heap Size Min: </th>
								<td><code id='win_size_min'>?</code></td>

								<th>Connection Min: </th>
								<td><code id='connect_speed_min'>?</code></td>

								<th>Was Focused: </th>
								<td><code id='doc_focus_was'>?</code></td>
							</tr>
							<tr>
								<th>Map State: </th>
								<td><code id="map_state">(not updated)</code></td>

								<th></th>
								<td></td>

								<th>Heap Size Max: </th>
								<td><code id='win_size_max'>?</code></td>

								<th>Connection Max: </th>
								<td><code id='connect_speed_max'>?</code></td>
							</tr>
							<tr>
								<th>Game State: </th>
								<td><code id="game_state"><?php echo $state; ?></code></td>

								<th></th>
								<td></td>

								<th>Heap Size Limit: </th>
								<td><code id='win_size_limit'>?</code></td>

								<th>Round-Trip: </th>
								<td><code id='rtt'>?</code></td>
							</tr>
							<tr>
								<th>Last State Update: </th>
								<td><code id="states_updated">(not updated)</code></td>
							</tr>
						</table>
					</fieldset>
				<?php endif; ?>
			</div>
		</div>

		<script type="text/javascript" charset="utf-8" src="scripts/funcs.js"></script>
		<script type="text/javascript" charset="utf-8" src="scripts/classes.js"></script>
		<script type="text/javascript" charset="utf-8" src="scripts/control_board.js"></script>
		<script type="text/javascript" charset="utf-8" src="scripts/update.js"></script>
		<script type="text/javascript" charset="utf-8" src="scripts/map.js"></script>
		<script type="text/javascript" charset="utf-8" src="scripts/action.js"></script>
		<script type="text/javascript" charset="utf-8" src="scripts/events.js"></script>
		<script type='text/javascript' charset='utf-8'>
			// Load javascript objects
			window.id = <?php echo $info->general->id; ?>;
			window.isAdmin = <?php echo ($_SESSION['missile_game_is_admin'] === true ? 'true' : 'false'); ?>;

			<?php $paused = json_decode(file_get_contents("games/$GID/ispaused.json")); ?>
			window.isPaused = <?php echo $paused -> paused; ?>
			window.pausedPlayer = <?php echo $paused -> player; ?>

			window.data = new Object();
			window.data.state = <?php echo "'$state'"; ?>;
			window.data.lastState = null;
			window.data.vars = <?php echo removeNewLines(file_get_contents("games/$GID/vars.json")); ?>;
			window.data.silos = <?php echo "{\"player_1\":" . removeNewLines(file_get_contents("games/$GID/silos-player_1.json")) . ", \"player_2\":" .  removeNewLines(file_get_contents("games/$GID/silos-player_2.json")) . "}"; ?>;
			window.data.defence_posts = <?php echo "{\"player_1\":" . removeNewLines(file_get_contents("games/$GID/defence_posts-player_1.json")) . ", \"player_2\":" .  removeNewLines(file_get_contents("games/$GID/defence_posts-player_2.json")) . "}"; ?>;
			window.data.countries = <?php echo removeNewLines(file_get_contents("games/$GID/countries.json")); ?>;
			window.data.events = <?php echo removeNewLines(file_get_contents("games/$GID/events.json")); ?>;

			// This stores window.data.vars for the current users' player
			window.data.me = window.data.vars.player_<?php echo $_SESSION['missile_game_is_admin'] === true ? '1' : '2'; ?>;
			window.data.enemy = window.data.vars.player_<?php echo $_SESSION['missile_game_is_admin'] === true ? '2' : '1'; ?>;
			window.me = <?php echo $_SESSION['missile_game_is_admin'] === true ? '"player_1"' : '"player_2"'; ?>;
			window.enemy = <?php echo $_SESSION['missile_game_is_admin'] === true ? '"player_2"' : '"player_1"'; ?>;

			window.data.cities = new Object();
			window.data.cities.RU = <?php echo removeNewLines(file_get_contents("games/$GID/ru_cities.json")); ?>;
			window.data.cities.ru = window.data.cities.RU;
			window.data.cities.US = <?php echo removeNewLines(file_get_contents("games/$GID/us_cities.json")); ?>;
			window.data.cities.us = window.data.cities.US;

			window.data.message_old = textToHtml("<?php echo file_get_contents("games/$GID/msg_history.txt"); ?>");

		<?php if ($_SESSION['missile_game_is_admin'] === true): ?>
			try {
				window.HeapSizeMin = window.performance.memory.usedJSHeapSize;
				document.getElementById('win_size_min').innerHTML = '<span class="status_good">' + commas(window.HeapSizeMin) + ' [' + ((window.HeapSizeMin/window.performance.memory.jsHeapSizeLimit)*100).toPrecision(3) + '%]</span>';
				window.HeapSizeMax = window.performance.memory.usedJSHeapSize;
				document.getElementById('win_size_max').innerHTML = '<span class="status_bad">' + commas(window.HeapSizeMax) + ' [' + ((window.HeapSizeMax/window.performance.memory.jsHeapSizeLimit)*100).toPrecision(3) + '%]</span>';
				document.getElementById('win_size').innerHTML = '<span class="status_neutral">' + commas(window.HeapSizeMax) + ' [' + ((window.HeapSizeMax/window.performance.memory.jsHeapSizeLimit)*100).toPrecision(3) + '%]</span>';

				document.getElementById('win_size_limit').innerText = commas(window.performance.memory.jsHeapSizeLimit);
			} catch (e) { console.warn('Heap size is not supported'); }

			try {
				window.ConnectionSpeedMin = navigator.connection.downlink;
				document.getElementById('connect_speed_min').innerHTML = '<span class="status_bad">' + window.commas(window.ConnectionSpeedMin) + '<small> Mbps </small>[' + navigator.connection.effectiveType + ']<small> &plusmn; 25 Kbps</small></span>';
				window.ConnectionSpeedMax = navigator.connection.downlink;
				document.getElementById('connect_speed_max').innerHTML = '<span class="status_good">' + window.commas(window.ConnectionSpeedMax) + '<small> Mbps </small>[' + navigator.connection.effectiveType + ']<small> &plusmn; 25 Kbps</small></span>';
				document.getElementById('connect_speed').innerHTML = '<span class="status_neutral">' + window.commas(window.ConnectionSpeedMax) + '<small> Mbps </small>[' + navigator.connection.effectiveType + ']<small> &plusmn; 25 Kbps</small></span>';
			} catch (e) { console.warn('Connection speed is not supported'); }

			window.eventMouseMove = function(event) {
				document.getElementById('coords').innerHTML = '('+event.clientX+', '+event.clientY+')';
				document.getElementById('coords_map').innerHTML = '('+Math.round(event.clientX-Constants.TARGET_OFFSET_X)+', '+Math.round(event.clientY-Constants.TARGET_OFFSET_Y)+')';
			}
			document.body.addEventListener('mousemove', window.eventMouseMove);

			setInterval(function(){
				document.getElementById('action_current').innerHTML = Action.Current;
				document.getElementById('map_state').innerHTML = Map.GetState();
				document.getElementById('states_updated').innerText = Time.Now(true);
				document.getElementById('active_popup').innerText = (Active.PopupViewing == null ? 'N/A' : Active.PopupViewing);


				try {
					let size = window.performance.memory.usedJSHeapSize;
					document.getElementById('win_size').innerHTML = '<span class="status_neutral">' + window.commas(size) + ' [' + ((size/window.performance.memory.jsHeapSizeLimit)*100).toPrecision(3) + '%]</span>';

					if (size > window.HeapSizeMax) {
						window.HeapSizeMax = size;
						document.getElementById('win_size_max').innerHTML = '<span class="status_bad">' + window.commas(window.HeapSizeMax) + ' [' + ((size/window.performance.memory.jsHeapSizeLimit)*100).toPrecision(3) + '%]</span>';
					} else if (size < window.HeapSizeMin) {
						window.HeapSizeMin = size;
						document.getElementById('win_size_min').innerHTML = '<span class="status_good">' + window.commas(window.HeapSizeMin) + ' [' + ((size/window.performance.memory.jsHeapSizeLimit)*100).toPrecision(3) + '%]</span>';
					}
				} catch(e) { }

				try {
					document.getElementById('rtt').innerHTML = window.navigator.connection.rtt + ' &plusmn; 25 ms';

					let speed = navigator.connection.downlink;
					document.getElementById('connect_speed').innerHTML = '<span class="status_neutral">' + window.commas(speed) + '<small> Mbps </small>[' + navigator.connection.effectiveType + ']<small> &plusmn; 25 Kbps</small></span>';

					if (speed > window.ConnectionSpeedMax) {
						window.ConnectionSpeedMax = speed;
						document.getElementById('connect_speed_max').innerHTML = '<span class="status_good">' + window.commas(window.ConnectionSpeedMax) + '<small> Mbps </small>[' + navigator.connection.effectiveType + ']<small> &plusmn; 25 Kbps</small></span>';
					} else if (speed < window.ConnectionSpeedMin) {
						window.ConnectionSpeedMin = speed;
						document.getElementById('connect_speed_min').innerHTML = '<span class="status_bad">' + window.commas(window.ConnectionSpeedMin) + '<small> Mbps </small>[' + navigator.connection.effectiveType + ']<small> &plusmn; 25 Kbps</small></span>';
					}
				} catch(e) { }
			}, 1000)
		<?php endif; ?>
		</script>
		<script type="text/javascript" charset="utf-8" src="scripts/__main__.js"></script>
	</body>
</html>
