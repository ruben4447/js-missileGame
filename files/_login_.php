<?php
	if ($_POST['gid'] != ''):
		$GID = $_POST['gid'];

		$game = json_decode(file_get_contents("../games/$GID/vars.json"));
		if (gettype($game) == 'string') $game = json_decode($game);
		$state = preg_replace("/\s+/", "", file_get_contents("../games/$GID/state.txt"));

		switch ($state):
			case 'closed':
				if ($_POST['pswd'] == $game->general->password):
					// Go to game screen
					session_start();
					$_SESSION['missile_game_active'] = $GID;
					$_SESSION['missile_game_is_admin'] = true;

					// Mark game as open
					file_put_contents("../games/$GID/state.txt", "open");

					die(header('Location: ../game.php'));
				else:
					die(header('Location: ../gamelogin.php?auth=tdwkexd1&gid='.$GID.'&error=1'));
				endif;
				break;
			case 'open':
				if ($_POST['code'] == $game -> general -> join_code):
					// Go to game screen
					session_start();
					$_SESSION['missile_game_active'] = $GID;
					$_SESSION['missile_game_other_player'] = true;

					// Mark game as full
					file_put_contents("../games/$GID/state.txt", "full");

					die(header('Location: ../game.php'));
				else:
					die(header('Location: ../gamelogin.php?auth=tdwkexd1&gid='.$GID.'&error=1'));
				endif;
				break;
		endswitch;
	else:
		die('System.Core.Exception.Client.BadRequest (400) :: (No additional information)');
	endif;
?>
