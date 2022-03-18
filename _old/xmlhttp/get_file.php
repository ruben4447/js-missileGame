<?php
	session_start();

	$file = '../games/' . $_SESSION['missile_game_active'] . '/' . $_GET['file'];

	if (file_exists($file) || $_GET['file'] == "silos.json" || $_GET['file'] == "defence_posts.json"):
		// Combine files if silos.json or defence_posts.json
		if ($file == "silos.json"):
			echo "{\"player_1\":" . file_get_contents('../games/' . $_SESSION['missile_game_active'] . '/silos-player_1.json') . ", \"player_2\":" . file_get_contents('silos-player_2.json') . "\"}";
		elseif ($file == "defence_posts.json"):
			echo "{\"player_1\":" . file_get_contents('../games/' . $_SESSION['missile_game_active'] . '/defence_posts-player_1.json') . ", \"player_2\":" . file_get_contents('defence_posts-player_2.json') . "}";
		else:
			echo file_get_contents($file);
		endif;
	else:
		echo 'E_404';
	endif;
?>
