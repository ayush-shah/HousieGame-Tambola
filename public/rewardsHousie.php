<?php
include '../vendor/autoload.php';

use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version1X;

$version = new Version1X(("http://localhost:5000"));
$client = new Client($version);
$client->initialize();
$client->emit("new_data", ["test"]);
$client->close();
