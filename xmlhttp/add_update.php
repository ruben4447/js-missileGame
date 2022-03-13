<?php
	session_start();
	
	$file = $_GET['file'];
	$execCodes = explode(',', $_GET['execcodes']);
	if (count($execCodes) == 0) $execCodes = Array();
	$GID = $_SESSION['missile_game_active'];
	
	$update_file = '../games/' . $GID . '/' . $file;
	
	if (file_exists($update_file)):
		$json = json_decode(file_get_contents('../games/' . $GID . '/update.json'));
		$json -> $file = [
			"player_1" => false,  // Records if player_1 has updated this file
			"player_2" => false,   // Records if player_2 has updated this file
			"exec" => $execCodes
		];
		file_put_contents('../games/' . $GID . '/update.json', json_encode($json));
		echo 'Updated';

	else:
		echo 'E_404';
	endif;
?>