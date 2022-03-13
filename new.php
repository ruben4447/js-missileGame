<?php
	if ($_POST['prepared'] == "yes"):
		$GID = time();

		// Clone _TEMPLATE game folder
		exec("mkdir games/$GID", $output);
		exec("cp games/_TEMPLATE/* games/$GID/");

		// Make game code (join code)
		define("GAME_CODE", mt_rand(0, 999));

		// Insert game data into vars.json
		$json = json_decode(file_get_contents("games/$GID/vars.json"));
		$json_us_cities = json_decode(file_get_contents("games/$GID/us_cities.json"));
		$json_ru_cities = json_decode(file_get_contents("games/$GID/ru_cities.json"));

		$json->general->id = $GID;
		$json->general->name = $_POST['name'];
		$json->general->password = $_POST['pswd'];
		$json->general->join_code = GAME_CODE;

		if (mt_rand(0, 1) == 0):
			$json->player_1->region = 'US';
			$json->player_2->region = 'RU';
			$json->player_1->colour = '#09F';
			$json->player_1->ally_colour = '#90CDF5';
			$json->player_1->weapon_colour = "#44E";
			$json->player_2->colour = '#DB5454';
			$json->player_2->ally_colour = '#D77';
			$json->player_2->weapon_colour = '#E22';

			$json_us_cities->owner = 'player_1';
			$json_ru_cities->owner = 'player_2';

			foreach ($json_us_cities as $city => $obj):
				if (gettype($json_us_cities->$city) == 'object'):
					$json->player_1->population += $json_us_cities->$city->population;
					$json_us_cities->$city->population_100p = $json_us_cities->$city->population;
				endif;
			endforeach;
			$json->player_1->population_100p = $json->player_1->population;

			foreach ($json_ru_cities as $city => $obj):
				if (gettype($json_ru_cities->$city) == 'object'):
					$json->player_2->population += $json_ru_cities->$city->population;
					$json_ru_cities->$city->population_100p = $json_ru_cities->$city->population;
				endif;
			endforeach;
			$json->player_2->population_100p = $json->player_2->population;

		else:
			$json->player_1->region = 'RU';
			$json->player_2->region = 'US';
			$json->player_1->colour = '#DB6565';
			$json->player_1->ally_colour = '#D77';
			$json->player_1->weapon_colour = '#E22';
			$json->player_2->colour = '#09F';
			$json->player_2->ally_colour = '#90CDF5';
			$json->player_2->weapon_colour = '#44E';

			$json_us_cities->owner = 'player_2';
			$json_ru_cities->owner = 'player_1';

			foreach ($json_ru_cities as $city => $obj):
				if (gettype($json_ru_cities->$city) == 'object'):
					$json->player_1->population += $json_ru_cities->$city->population;
					$json_ru_cities->$city->population_100p = $json_ru_cities->$city->population;
				endif;
			endforeach;
			$json->player_1->population_100p = $json->player_1->population;

			foreach ($json_us_cities as $city => $obj):
				if (gettype($json_us_cities->$city) == 'object'):
					$json->player_2->population += $json_us_cities->$city->population;
					$json_us_cities->$city->population_100p = $json_us_cities->$city->population;
				endif;
			endforeach;
			$json->player_2->population_100p = $json->player_2->population;
		endif;

		file_put_contents("games/$GID/vars.json", json_encode($json));
		file_put_contents("games/$GID/us_cities.json", json_encode($json_us_cities));
		file_put_contents("games/$GID/ru_cities.json", json_encode($json_ru_cities));
?>
<html>
	<head>
		<title>MAD Missile Destruction: Game Created</title>
		<link rel='stylesheet' href='data/indexstyles.css' />
	</head>
	<body>
		<h2>Game Created!</h2>
		<p>Game Name: <?php echo $_POST['name']; ?></p>
		<p>This code will allow another player to join a game:<br>
		Game Join Code: <?php echo GAME_CODE; ?></p>
		<br><br>
		<a href='index.php'>Back to Main Menu</a>
	</body>
</html>
<?php
	else:
?>
<html>
	<head>
		<title>MAD Missile Destruction: New Game</title>
		<link rel='stylesheet' href='data/indexstyles.css' />
	</head>

	<body>
		<h1>New Game</h1>
		<a href="index.php">Back (cancel)</a>
		<br><br>
		<form method="POST" action="new.php">
			<input type="hidden" name="prepared" value="yes" />
			<p>Your new game needs a name</p>
			<input type="text" name="name" required='required' autocomplete='off' />
			<p>Each game requires a password so others cannot log in to it</p>
			<b>Password: </b><input type="password" name="pswd" required="required" />
			<p>A multiplayer join code will be provided after creation</p>
			<br>
			<button type="submit">Create</button>
		</form>
	</body>
</html>
<?php
	endif;
?>
