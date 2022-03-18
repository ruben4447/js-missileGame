<?php
	session_start();

	$fstate = '../games/' . $_SESSION['missile_game_active'] . '/state.txt';
	$fupdate = '../games/' . $_SESSION['missile_game_active'] . '/update.json';
	$fpaused = '../games/' . $_SESSION['missile_game_active'] . '/ispaused.json';

	if (file_exists($fstate)):
		$state = preg_replace("/\s+/", "", file_get_contents($fstate));
	elseif ($_SESSION['missile_game_active'] == ''):
		$state = 'no_gid';
	else:
		$state = 'gone';
	endif;

	if ($state == 'full'):
		if (!file_exists($fupdate) || !file_exists($fpaused)):
			die('E_404');
		endif;
		echo "[\"" . $state . "\", " . file_get_contents($fupdate) . ", " . file_get_contents($fpaused) . "]";
	else:
		echo "[\"" . $state . "\"]";
	endif;
?>
