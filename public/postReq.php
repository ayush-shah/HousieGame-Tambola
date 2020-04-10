<?php
date_default_timezone_set("Asia/Kolkata");
$num = range(1, 90);
shuffle($num);
$myfile = new \stdClass();
$myfile1 = new \stdClass();
if (isset($_POST["submit"])) {
    $time = date("i");
    $time = $time * 60 + date("s")+10;
    $mobile = $_POST["mobile"];
    $name = $_POST["name"];
    $myfile = json_decode(file_get_contents("Data.json"));
    $myfile->$mobile = array("num" => $num,"time" => $time);
    file_put_contents("Data.json", json_encode($myfile));
    setcookie("$mobile", "$name", time() + 700, "/");
} else if (isset($_POST["submit1"])) {
    $name1 = $_POST["name1"];
    $mobile1 = $_POST["mobile1"];
    $myfile1 = json_decode(file_get_contents("Data.json"), true);
    if (array_key_exists("$mobile1", $myfile1)) {
        setcookie("$mobile1", "$name1", time() + 590, "/");
    } else {
        echo false;
    }
}
