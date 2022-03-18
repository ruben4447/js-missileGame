<?php
	function isJson($str) {
		json_decode($str);
		return json_last_error() == JSON_ERROR_NONE;
	}


	if ($_POST['auth'] == "4447"):
		session_start();
		$file = '../games/' . $_SESSION['missile_game_active'] . '/' . $_POST['file'];

		if (file_exists($file) || $_POST['file'] == 'silos.json' || $_POST['file'] == 'defence_posts.json'):
			$data = $_POST['data'];
			if (isJson($data)):
				// Special handling for silos.json or defence_posts.json
				if ($_POST['file'] == 'silos.json' || $_POST['file'] == 'defence_posts.json'):
					$from = $_POST['from'];
					if ($from == "player_1" || $from == "player_2"):
						$insert_data = json_encode(json_decode($data) -> $from);
						if ($_POST['file'] == 'silos.json') file_put_contents('../games/' . $_SESSION['missile_game_active'] . '/silos-' . $from . '.json', $insert_data);
						elseif ($_POST['file'] == 'defence_posts.json') file_put_contents('../games/' . $_SESSION['missile_game_active'] . '/defence_posts-' . $from . '.json', $insert_data);
						echo '200 OK';
					else:
						echo 'E_400';
					endif;
				else:
					// Default; just dump contents
					file_put_contents($file, $data);
					echo '200 OK';
				endif;
			else:
				echo 'E_400';
			endif;
		else:
			echo 'E_404';
		endif;
	else:
		echo 'E_401';
	endif;
?>
