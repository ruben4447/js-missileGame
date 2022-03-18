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


            if ($_POST['file'] == null):
                $GID = $_GET['gid'];
                if (!file_exists("../games/$GID/state.txt")) die('Invalid game identifier.');
        ?>
            <h1>Edit Game File</h1>
            <a href="edit_game.php?gid=<?php echo $GID; ?>">Back to Edit Menu</a>
            <br><br>
            <form action="edit_game_files.php" method="post">
                <input type='hidden' name='gid' value='<?php echo $GID; ?>' />
                <b>Select File: </b>
                <br><br>
                <?php
                    $files = glob("../games/$GID/*");
                    foreach ($files as $file):
                        $name = str_replace("../games/$GID/", "", $file);
                        echo "<button type='submit' name='file' value='$name'>$name</button><br>";
                    endforeach;
                ?>
            </form>
        <?php
            else:
                $GID = $_POST['gid'];
                if (!file_exists("../games/$GID/state.txt")) die('Invalid game identifier.');
                $file = $_POST['file'];

                if (!file_exists("../games/$GID/$file")) die('File ' . $file . ' could not be found.');

                if ($_POST['state'] == 'save'):
                    $contents = $_POST['contents'];
                    file_put_contents("../games/$GID/$file", $contents);
                else:
                    $contents = file_get_contents("../games/$GID/$file");
                endif;
        ?>
            <h1>Edit Game File: <?php echo $file; ?></h1>
            <a href="edit_game.php?gid=<?php echo $GID; ?>">Back (no save) to Edit Menu</a>
            <br><br>
            <?php
                if ($_POST['state'] == 'save'):
                    echo '<div class="msg">File ' . $file . ' has been saved (' . date('d/m/Y \a\t H:i:s') . ')</div><br>';
                endif;
            ?>
            <form action="edit_game_files.php" method="post">
                <input type='hidden' name='gid' value='<?php echo $GID; ?>' />
                <input type='hidden' name='file' value='<?php echo $file; ?>' />
                <textarea name="contents" rows="25" cols="120"><?php echo $contents; ?></textarea>
                <br><br>
                <button type='submit' name='state' value='save'>Save File</button>
            </form>
        <?php
            endif;
        ?>
    </body>
</html>
