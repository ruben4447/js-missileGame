<?php
	session_start();
	$_SESSION['missile_game_active'] = null;
	$_SESSION['missile_game_is_admin'] = null;
	$_SESSION['missile_game_other_player'] = null;
	
	header('Location: ../index.php');
?>