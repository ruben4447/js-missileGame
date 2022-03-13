<?php
	session_start();

	$file = $_GET['file'];
	$player = $_GET['player'];
	$GID = $_SESSION['missile_game_active'];

	$update_file = '../games/' . $GID . '/' . $file;

	if (file_exists($update_file)):
		$json = json_decode(file_get_contents('../games/' . $GID . '/update.json'));
		if ($json -> $file != null):
			if ($player == 'player_1' || $player == 'player_2'):
				$json -> $file -> $player = true;

				// If both player_1 and player_2 is true, remove update
				if ($json -> $file -> player_1 == true && $json -> $file -> player_2 == true):
					unset($json -> $file);
					echo 'Removed';
				else:
					echo 'Marked';
				endif;

				file_put_contents('../games/' . $GID . '/update.json', json_encode($json));
			else:
				echo 'E_404_2';
			endif;
		else:
			echo 'Not Marked';
		endif;

	else:
		echo 'E_404_1';
	endif;
?>
