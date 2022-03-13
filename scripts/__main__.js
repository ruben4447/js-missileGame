// Initiate the game
function _init_() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;

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
window.onload = _init_;
window.onbeforeunload = _close_;
