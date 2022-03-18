<?php
	if ($_GET['auth'] == '2e4ri1kxb' && $_GET['gid'] != ''):
		$GID = $_GET['gid'];

		// Check if game exists
		if (!in_array("../games/$GID", glob("../games/*"))):
			die('System.Core.Exception.Client.BadRequest (400) :: System.Core.Exception.Client.NotFound (404) :: Game with ID ' . $GID . ' does not exist');
		endif;

		exec("rm -r ../games/$GID/");

		header('Location: ../index.php');
	else:
		die('System.Core.Exception.Client.BadRequest (400) :: (No additional information)');
	endif;
?>
