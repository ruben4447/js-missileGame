<!DOCTYPE html>
<html lang="en" dir="ltr">
    <head>
        <meta charset="utf-8">
        <title>MAD Missile Destruction</title>
        <link rel="stylesheet" href="../styles/indexstyles.css">
    </head>
    <body>
        <?php
            session_start();
            if ($_SESSION['is_super_admin'] != 'YES') die('Access denied.');

            $GID = $_GET['gid'];
            if (!file_exists("../games/$GID/state.txt")) die('Invalid game identifier.');
            $game = json_decode(file_get_contents('../games/' . $GID . '/vars.json')) -> general;;
        ?>
        <h1>Edit Game <?php echo $game -> name; ?></h1>
        <a href="../">Back to Main Menu</a>
        <br><br>
        <?php
            if ($_GET['msg'] != ""):
                echo '<div class="msg">';
                switch ($_GET['msg']):
                    case '1':
                        echo 'Updated game state to ' . htmlentities($_GET['state']);
                        break;
                endswitch;
                echo '</div><br>';
            endif;
        ?>
        <ul>
            <li><a href='change_state.php?gid=<?php echo $game -> id; ?>'>Change Game State</a></li>
            <li><a href='edit_game_files.php?gid=<?php echo $game -> id; ?>'>Edit Game Files</a></li>
            <li><a href="javascript:void(0)" onclick="if (window.confirm('Are you sure you want to delete this game?\nIf anyone is playing, they will be kicked.')) window.location.href = '_delete_.php?gid=<?php echo $game -> id; ?>&auth=2e4ri1kxb'"><b>DELETE GAME</b></a></li>
        </ul>
    </body>
</html>
