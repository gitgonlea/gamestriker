<?php
header('Content-Type: application/json');
require_once('./GameQ/Autoloader.php');

$serverIP = $_GET['host'] . ':' . $_GET['port'];

$GameQ = new \GameQ\GameQ();
$GameQ->addServer([
    'type' => 'cs16',
    'host' => $serverIP,
]);
$results = $GameQ->process();
echo json_encode($results);
?>