<?php
    session_start();
    $GID = $_SESSION['missile_game_active'];

    $json = json_decode(file_get_contents("../games/$GID/ispaused.json"));

    switch ($_GET['user']):
        case 'player_1':
            $json -> player_1 = ($_GET['paused'] == 'true');
            break;
        case 'player_2':
            $json -> player_2 = ($_GET['paused'] == 'true');
            break;
        default:
            die('E_400: unrecognised user: ' . $_GET['user']);
    endswitch;

    file_put_contents("../games/$GID/ispaused.json", json_encode($json));
?>
