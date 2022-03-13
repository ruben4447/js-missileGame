<?php
    session_start();
    $GID = $_SESSION['missile_game_active'];

    if (file_exists('../games/' . $GID . '/msg_history.txt')):
        file_put_contents('../games/' . $GID . '/msg_history.txt', $_POST['text']);
        echo '200 OK';
    else:
        echo 'E_404';
    endif;
?>
