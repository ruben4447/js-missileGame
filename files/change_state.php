<?php
    session_start();
    if ($_SESSION['is_super_admin'] != 'YES') die('Access denied.');

    if ($_POST['sure'] == '1'):
        $GID =  $_POST['gid'];
        if (!file_exists('../games/' . $GID . '/state.txt')) die('Invalid game identifier.');

        $state = preg_replace("/\s+/", "", $_POST['state']);
        file_put_contents('../games/' . $_POST['gid'] . '/state.txt', $state);
        die(header('Location: edit_game.php?gid=' . $GID . "&msg=1&state=" . $state));
    else:
        $GID = $_GET['gid'];
        if (!file_exists('../games/' . $GID . '/state.txt')) die('Invalid game identifier.');
?>
        <!DOCTYPE html>
        <html lang="en" dir="ltr">
            <head>
                <meta charset="utf-8">
                <link rel="stylesheet" href="../styles/indexstyles.css">
                <title>MAD Missile Destruction</title>
            </head>
            <body>
                <h1>Change Game State</h1>
                <a href="edit_game.php?gid=<?php echo $GID; ?>">Back to Edit Menu</a>
                <br><br>
                <form action="change_state.php" method="post">
                    <input type="hidden" name="sure" value="1" />
                    <input type="hidden" name="gid" value="<?php echo $_GET['gid']; ?>" />
                    <p>
                        Current State: <?php echo file_get_contents('../games/' . $_GET['gid'] . '/state.txt'); ?>
                    </p>
                    <p>
                        New State: &nbsp;
                        <select name="state" required>
                            <option value="" disabled selected>Select One</option>
                            <option value="closed">Closed [&#128272;]</option>
                            <option value="open">Open [&#128275;]</option>
                            <option value="full">Full [&#128683;]</option>
                            <option value="locked">Locked [&#128274;]</option>
                        </select>
                        &nbsp;&nbsp;
                        <button type="submit">Change State</button>
                    </p>
                </form>
            </body>
        </html>
<?php
    endif;
?>
