<?php
    function isJson($str) {
        json_decode($str);
        return json_last_error() == JSON_ERROR_NONE;
    }

    if ($_POST['auth'] == 4447):
        $event = $_POST['event'];
        if (isJson($event)):
            session_start();
            $GID = $_SESSION['missile_game_active'];
            $json = json_decode(file_get_contents('../games/' . $GID . '/events.json'));
            array_push($json, $event);
            file_put_contents('../games/' . $GID . '/events.json', json_encode($json));
            echo '200';
        else:
            echo 'E_400';
        endif;
    else:
        echo 'E_401';
    endif;
?>
