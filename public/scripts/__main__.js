function main() {
  const socket = io();
  window.socket = socket;
  const params = new URLSearchParams(location.search.substring(1)), token = Array.from(params)?.[0]?.[0], gameID = params.get("id");

  socket.on("alert", text => alert(text));
  socket.on("id-ok", data => {
    if (data === null) {
      alert("Unable to join game");
      location.href = "/menu.html?" + token;
    } else {
      window.id = data.id;
      window.isAdmin = data.isAdmin;
      window.isPaused = data.isPaused;
      window.pausedPlayer = data.pausedPlayer;
      window.data = data.data;
      window.me = data.me;
      window.enemy = data.enemy;
      window.data.cities.ru = data.data.cities.RU;
      window.data.cities.us = data.data.cities.US;
      window.data.message_old = textToHtml(data.message_old);

      if (data.isAdmin) {
        document.querySelectorAll(".game_state").innerText = window.data.state;

        try {
          window.HeapSizeMin = window.performance.memory.usedJSHeapSize;
          document.getElementById('win_size_min').innerHTML = '<span class="status_good">' + commas(window.HeapSizeMin) + ' [' + ((window.HeapSizeMin / window.performance.memory.jsHeapSizeLimit) * 100).toPrecision(3) + '%]</span>';
          window.HeapSizeMax = window.performance.memory.usedJSHeapSize;
          document.getElementById('win_size_max').innerHTML = '<span class="status_bad">' + commas(window.HeapSizeMax) + ' [' + ((window.HeapSizeMax / window.performance.memory.jsHeapSizeLimit) * 100).toPrecision(3) + '%]</span>';
          document.getElementById('win_size').innerHTML = '<span class="status_neutral">' + commas(window.HeapSizeMax) + ' [' + ((window.HeapSizeMax / window.performance.memory.jsHeapSizeLimit) * 100).toPrecision(3) + '%]</span>';

          document.getElementById('win_size_limit').innerText = commas(window.performance.memory.jsHeapSizeLimit);
        } catch (e) {
          console.warn('Heap size is not supported');
        }

        try {
          window.ConnectionSpeedMin = navigator.connection.downlink;
          document.getElementById('connect_speed_min').innerHTML = '<span class="status_bad">' + window.commas(window.ConnectionSpeedMin) + '<small> Mbps </small>[' + navigator.connection.effectiveType + ']<small> &plusmn; 25 Kbps</small></span>';
          window.ConnectionSpeedMax = navigator.connection.downlink;
          document.getElementById('connect_speed_max').innerHTML = '<span class="status_good">' + window.commas(window.ConnectionSpeedMax) + '<small> Mbps </small>[' + navigator.connection.effectiveType + ']<small> &plusmn; 25 Kbps</small></span>';
          document.getElementById('connect_speed').innerHTML = '<span class="status_neutral">' + window.commas(window.ConnectionSpeedMax) + '<small> Mbps </small>[' + navigator.connection.effectiveType + ']<small> &plusmn; 25 Kbps</small></span>';
        } catch (e) {
          console.warn('Connection speed is not supported');
        }

        window.eventMouseMove = function (event) {
          document.getElementById('coords').innerHTML = '(' + event.clientX + ', ' + event.clientY + ')';
          document.getElementById('coords_map').innerHTML = '(' + Math.round(event.clientX - Constants.TARGET_OFFSET_X) + ', ' + Math.round(event.clientY - Constants.TARGET_OFFSET_Y) + ')';
        };
        document.body.addEventListener('mousemove', window.eventMouseMove);

        setInterval(function () {
          document.getElementById('action_current').innerHTML = Action.Current;
          document.getElementById('map_state').innerHTML = Map.GetState();
          document.getElementById('states_updated').innerText = Time.Now(true);
          document.getElementById('active_popup').innerText = (Active.PopupViewing == null ? 'N/A' : Active.PopupViewing);


          try {
            let size = window.performance.memory.usedJSHeapSize;
            document.getElementById('win_size').innerHTML = '<span class="status_neutral">' + window.commas(size) + ' [' + ((size / window.performance.memory.jsHeapSizeLimit) * 100).toPrecision(3) + '%]</span>';

            if (size > window.HeapSizeMax) {
              window.HeapSizeMax = size;
              document.getElementById('win_size_max').innerHTML = '<span class="status_bad">' + window.commas(window.HeapSizeMax) + ' [' + ((size / window.performance.memory.jsHeapSizeLimit) * 100).toPrecision(3) + '%]</span>';
            } else if (size < window.HeapSizeMin) {
              window.HeapSizeMin = size;
              document.getElementById('win_size_min').innerHTML = '<span class="status_good">' + window.commas(window.HeapSizeMin) + ' [' + ((size / window.performance.memory.jsHeapSizeLimit) * 100).toPrecision(3) + '%]</span>';
            }
          } catch (e) { }

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
          } catch (e) { }
        }, 1000);

        // Fancy error handling
        // window.onerror = function (msg, src, line, col, error) {
        //   document.getElementById('wn_error').setAttribute('style', 'color:crimson;font-family:\'Courier New\';background:#D227;padding:3px;');
        //   document.getElementById('wn_error').innerHTML += '<b style="font-size:1.2em;">' + error + '</b><br>@ ' + src + ':' + line + ':' + col + '<br><br>';
        // };
      } else {
        document.getElementById("admin-stats").remove();
      }

      // Populate some HTML
      document.getElementById("map_div").innerHTML = data.svg_map;
      document.querySelectorAll(".join_code").forEach(e => e.innerText = data.data.vars.join_code);
      document.getElementById("main_time").innerText = getTime();
      let btnLeave = document.getElementById("btn_leave_game");
      btnLeave.addEventListener("click", () => location.href = "/menu.html?" + token);
      if (data.isAdmin) {
        let btn = document.createElement("button");
        btn.classList.add("btn_red");
        btn.innerText = "Delete Game";
        btn.addEventListener("click", () => location.href = "/delete-game/" + token + "/" + gameID);
        btnLeave.insertAdjacentElement("afterend", btn);

        btn = document.createElement("button");
        btn.classList.add("btn_red");
        btn.innerText = "Clear Msg History";
        btn.addEventListener("click", () => {
          document.getElementById('info_message').innerHTML = '';
          Update.SaveMessageHistory(true);
        });
        btnLeave.insertAdjacentElement("afterend", btn);
      }
      document.getElementById("btn_cancel_all_actions").addEventListener("click", () => Action.CancelAll());
      document.getElementById("control_board_flag").src = "flags/" + window.data.me.region + ".svg";
      document.getElementById("enemy_flag").src = "flags/" + window.data.enemy.region + ".svg";
      document.getElementById("enemy_flag").setAttribute("title", window.data.isAdmin ? "Player 2" : "Player 1");

      // Header
      document.title = "MAD Missile Destruction | " + data.data.vars.name;
      document.querySelector("link[rel='shortcut icon']").href = "flags/" + window.data.me.region + ".svg";

      _init_();
    }
  });
  socket.emit("id", { loc: 4, token, gameID });
}

// Initiate the game
function _init_() {
  // Load constants
  Constants.TARGET = document.querySelector('svg#map');
  Constants.TARGET_W = Constants.TARGET.width.baseVal.value;
  Constants.TARGET_H = Constants.TARGET.height.baseVal.value;
  Constants.AUTH = 4447;
  Constants.SILO_W = 4;		// Width of silos
  Constants.SILO_H = 4;		// Height of silos
  Constants.DEFENCE_W = 4;	// Width of defence posts
  Constants.DEFENCE_H = 4;	// Height of defence posts
  Constants.TARGET_BB = Constants.TARGET.getBoundingClientRect();
  Constants.TARGET_OFFSET_X = Constants.TARGET_BB.left.toFixed(2);
  Constants.TARGET_OFFSET_Y = Constants.TARGET_BB.top.toFixed(2);
  Constants.ADD_INCOME = true;
  Constants.TARGET_RADIUS = 2;
  Constants.WEAPON_LAUNCHED_TEXT = 'EN ROUTE';		// Text to show in countdown clock when weapon is launched
  Constants.DO_FOCUS_NEEDED = false;		// Should we check if bother users' windows have focus?
  Constants.SYMBOL_MORE = '<big>&#187;</big>';	// like a '>>' symbol

  console.log("initiating game...");

  document.querySelector('svg .country[data-id="RU"]').setAttribute('fill', window.data.vars[window.data.cities.ru.owner].colour);
  document.querySelector('svg .country[data-id="US"]').setAttribute('fill', window.data.vars[window.data.cities.us.owner].colour);

  // Check game/update state
  _update_();
  Constants.GAME_UPDATE_INTERVAL = setInterval(_update_, window.gamevars.update_state_time);

  // If a player is victorious...
  if (window.data.vars.winner != null) {
    Map.Winner(window.data.vars.winner);
    return 0;
  }

  Update.PopupSiloData();
  Calculations.WeaponSpeeds();
  Sounds.Init();

  Map.DrawDefences();
  Map.DrawCities();
  Map.DrawSilos();
  Map.ColourAllies();
  Map.SetState('idle');

  ControlBoard.GameOverviewStats();
  ControlBoard.Info();
  ControlBoard.Defence();
  ControlBoard.SiloListOverview();
  ControlBoard.AlliesOverview();
  ControlBoard.EventListOverview();

  // Income
  if (Constants.ADD_INCOME) setInterval(ControlBoardEvents.RoutineAddIncome, window.gamevars.update_income_time);

  // Events
  DocumentEvents.Keys();		// Keybindings
  ControlBoardEvents.UpdateIncome();
  MapEvents.InitClick();
  MapEvents.InitClickCountry();
  MapEvents.InitOverCountry();
  MapEvents.InitOver();
  CityEvents.AddListeners();
  SiloEvents.AddListeners();
  DefenceEvents.AddListeners();

  if (window.data.message_old == '')
    ControlBoard.ShowMsg('Welcome to MAD Missile Destruction!<br><small>You are the President of <img src="' + Map.GetFlagURL(window.data.me.region) + '" class="flag_ref" /> ' + getCountryName(window.data.me.region) + '. The aim is to obliterate the opponent, <img  src="' + Map.GetFlagURL(window.data.enemy.region) + '" class="flag_ref" /> ' + getCountryName(window.data.enemy.region) + '.<br>Build silos, launch missiles, defend enemy attacks, get allies, destroy enemy cities to win (black dots)</small>', null, true, false);
  else ControlBoard.ShowMsg(window.data.message_old, null, true, false);
}

// Routine game update
function _update_() {
  Update.RoutineCheck();
  if (Constants.DO_FOCUS_NEEDED) Update.CheckFocus();
  document.getElementById('main_time').innerText = getTime();
  return 0;
}

// Before the tab is closed...
function _close_() {
  Update.UniversalSave();
  return 'Do you really want to leave this page?';
}

// Add event listeners
window.onload = main;
window.onbeforeunload = _close_;