<?php
date_default_timezone_set("Asia/Kolkata");
$num = range(1, 90);
shuffle($num);
$myfile = fopen("public_html/beproj/Svelte/Data.txt", "w") or die("Unable to open file!");
fwrite($myfile, json_encode($num));
fclose($myfile);
