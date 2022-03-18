<?php
    session_start();
    $gameid = $_SESSION['missile_game_active'];

    if ($_GET['auth'] == 4447):
        $index = ($_GET['player'] == 'player_1' ? 0 : 1);
        $id = $_GET['eventID'];

        $json = json_decode(file_get_contents('../games/' . $gameid . '/events.json'));
        if (gettype($json) == 'string') $json = json_decode($json);

        for ($x = 0; $x < count($json); $x++):
            if ($json[$x] -> id == $id):
                $json[$x] -> done[$index] = true;

                // Now, if both done[]'s are true, remove the event
                if ($json[$x] -> done[0] == true && $json[$x] -> done[1] == true):
                    //unset($json[$x]);
                    array_splice($json, $x, 1);
                endif;

                break;
            endif;
        endfor;

        file_put_contents('../games/' . $gameid . '/events.json', json_encode($json));
        echo '200';
    else:
        die('E_401');
    endif;
?>
