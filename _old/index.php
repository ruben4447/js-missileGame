<?php
	Require '/var/services/web_require.php';
	session_start();

	// If there is game data, remove ite
	$_SESSION['missile_game_active'] = null;
	$_SESSION['missile_game_is_admin'] = null;
	$_SESSION['missile_game_other_player'] = null;

	define('GAMELOGIN_AUTH', 'tdwkexd1');

	$game_files = glob('games/*');
	$games = [];

	foreach ($game_files as $game):
		if ($game == "games/_TEMPLATE") continue;
		$info = json_decode(file_get_contents("$game/vars.json"));
		if (gettype($info) == 'string') $info = json_decode($info);
		$state = file_get_contents("$game/state.txt");
		$state = preg_replace("/\s+/", "", $state);

		switch ($state):
			case 'closed':
				$icon = '&#128272;';
				break;
			case 'open':
				$icon = "&#128275;";
				break;
			case 'full':
				$icon = '&#128683;';
				break;
			case 'locked':
				$icon = '&#128274;';
				break;
		endswitch;
		$games[] = [$info->general, $icon, $state];
	endforeach;
?>
<html>
	<head>
		<title>MAD Missile Destruction</title>
		<link rel='stylesheet' href='styles/indexstyles.css' />
	</head>

	<body>
		<h1>MAD Missile Destruction</h1>
		<br>
		<?php
			if ($_GET['error'] != ""):
				switch ($_GET['error']):
					case 0:
						echo "<div class='error'>Internal Error: Authorisation credentials are incorrect.</div>";
						break;
					case 1:
						echo "<div class='error'>Error: Game ID #" . $_GET['gid'] . " is invalid.</div>";
						break;
					case 2:
						echo "<div class='error'>Game #" . $_GET['gid'] . " no longer exists.</div>";
						break;
					case 3:
						echo "<div class='error'>Game #" . $_GET['gid'] . " is not accepting more players and therefore cannot be played.</div>";
						break;
					case 4:
						echo "<div class='error'>Game #" . $_GET['gid'] . " is full and therefore cannot be played.</div>";
						break;
					case 5:
						echo "<div class='error'>Game #" . $_GET['gid'] . "' has been locked and therefore cannot be played.</div>";
						break;
				endswitch;
				echo '<br>';
			endif;

			if ($_GET['msg'] != ""):
				switch ($_GET['msg']):
					case 1:
						echo "<div class='msg'>The administrator left your game. The admin must be playing for the game to be active.</div>";
						break;
				endswitch;
				echo '<br>';
			endif;
		?>
		<a href="new.php"><h2>New Game</h2></a>
		<br>
		<h2>Created Games</h2>
		<ul>
			<?php
				foreach ($games as $game):
					echo '<li><a href=\'gamelogin.php?gid=' . $game[0]->id . '&auth=' . GAMELOGIN_AUTH . '\'>' . $game[0]->name . '</a> &nbsp; [' . $game[1] . ' <small><code>' . $game[2] . '</code></small>]';
					if ($_SESSION['is_super_admin'] == 'YES'):
						echo ' &nbsp;&nbsp;&nbsp;<a href=\'files/edit_game.php?gid=' . $game[0]->id . '\'>Edit</a>';
					endif;
					echo '</li>';
				endforeach;
			?>
		</ul>
	</body>
</html>
