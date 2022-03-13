<?php
	if ($_GET['auth'] == "tdwkexd1" && $_GET['gid'] != ''):
		$GID = $_GET['gid'];

		// Check if game exist.
		$games = glob('games/*');
		if (!in_array("games/$GID", $games)):
			die(header('Location: index.php?error=2&gid=' . $GID));
		endif;

		// Get game info
		$game = json_decode(file_get_contents("games/$GID/vars.json"));
		if (gettype($game) == 'string') $game = json_decode($game);
		$state = preg_replace("/\s+/", "", file_get_contents("games/$GID/state.txt"));
?>
<html>
	<head>
		<title>MAD Missile Destruction: Game Login</title>
		<link rel='stylesheet' href='styles/indexstyles.css' />
	</head>
	<?php
		if ($game -> winner != null):
	?>
		<body>
			<h1>Enter Game '<?php echo $game->general->name; ?>'</h1>
			<a href="index.php">Back</a>
			<br><br>
			<p>This game has a winner and therefore is not accepting any players</p>
			<p>
				<i>Winner: <?php echo $game -> winner; ?></i>
			</p>
			<br>
			<a href="index.php">Back</a>
		</body>
	<?php
		else:
			switch ($state):
				case 'closed':
	?>
	<body onload='document.getElementById("input").focus()'>
		<h1>Open Game '<?php echo $game->general->name; ?>'</h1>
		<a href="index.php">Back</a>
		<br><br>
		<i>Only the game creator who knows the game password can do this.<br>If you wish to join this game, please wait until it has been opened.</i>
		<br><br><hr>
		<p><b>Password:</b></p>
		<?php
				if ($_GET['error'] == '1'):
					echo "<p class='error'>Password is Incorrect</p>";
				endif;
		?>
		<form method="POST" action="files/_login_.php">
			<input type="hidden" name="gid" value="<?php echo $game->general->id ?>" />
			<table>
				<tr>
					<td><input id='input' type="password" name="pswd" required='required' /></td>
					<td><button type="submit">Open Game</button></td>
				</tr>
			</table>
		</form>
		<hr>
	</body>
	<?php
					break;
				case 'open':
	?>
	<body onload='document.getElementById("input").focus()'>
		<h1>Join Game '<?php echo $game->general->name; ?>'</h1>
		<a href="index.php">Back</a>
		<hr>
		<p><b>Join Code:</b></p>
		<?php
					if ($_GET['error'] == '1'):
						echo "<p class='error'>Join Code is Incorrect</p>";
					endif;
		?>
		<form method="POST" action="files/_login_.php">
			<input type="hidden" name="gid" value="<?php echo $game->general->id ?>" />
			<table>
				<tr>
					<td><input id="input" type="password" name="code" required='required' /></td>
					<td><button type="submit">Join Game</button></td>
				</tr>
			</table>
		</form>
		<hr>
	</body>
	<?php
					break;
				case 'full':
	?>
	<body>
		<h2>Game '<?php echo $game->general->name; ?>' is full</h2>
		<p>&#128683; This game cannot be joined as it is currently full &#128683;</p>
		<a href="index.php">Back</a>
	</body>
	<?php
					break;
				case 'locked':
	?>
	<body>
		<h2>Game '<?php echo $game->general->name; ?>' is locked</h2>
		<p>&#128274; This game has been locked by a website administrator and cannot be accessed &#128274;</p>
		<a href="index.php">Back</a>
	</body>
	<?php
					break;
			endswitch;
		endif;
	?>
</html>
<?php
	else:
		die('System.Core.Exception.Client.Unauthorised (401) :: Invalid authorisation data');
	endif;
?>
