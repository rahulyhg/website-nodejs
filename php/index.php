<?php
require str_replace('php', '', __DIR__ ) . 'vendor/autoload.php';

$app = new \Slim\Slim();

$app->get('/:filepath/', function ($filepath) {
	require __DIR__.'/' . $filepath . '.php';
});

$app->run();