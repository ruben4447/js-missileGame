<pre>
    <?php
        $json = "[{\"id\":1, \"num\":7162}, {\"id\":2, \"num\":284}, {\"id\":3, \"num\":122}]";
        var_dump($json);
        echo '<hr>';

        $data = json_decode($json);
        $remid = 2;
        var_dump($data);

        for ($x = 0; $x < count($data); $x += 1):
            if ($data[$x] -> id == $remid):
                unset($data[$x]);
                //array_splice($data, $x, 1);
                echo "Removed ID " . $remid . "<hr>";
                break;
            endif;
        endfor;

        $json = json_encode($data);
        var_dump($json);
    ?>
</pre>
