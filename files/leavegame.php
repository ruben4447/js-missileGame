<?php
	session_start();
	if ($_SESSION['missile_game_active'] != '' && ($_SESSION['missile_game_is_admin'] === true || $_SESSION['missile_game_other_player'] === true)):
		$GID = $_GET['gid'];
		// Check if game exists
		if (!in_array("../games/$GID", glob("../games/*"))):
			die("404 - Game doesn't exist");
		endif;
		
		// If 'other player', set game state to 'open'
		if ($_SESSION['missile_game_other_player'] === true):
			file_put_contents("../games/$GID/state.txt", "open");
		elseif ($_SESSION['missile_game_is_admin'] === true):
			// without admin, game is inactive
			file_put_contents("../games/$GID/state.txt", "closed");
		endif;
		
		// Clear session data
		$_SESSION['missile_game_active'] = null;
		$_SESSION['missile_game_is_admin'] = null;
		$_SESSION['missile_game_other_player'] = null;

		die(header('Location: ../index.php'));
		
	else:
		die('System.Core.Exception.Client.BadRequest (400) :: (No other information)');
	endif;
?>