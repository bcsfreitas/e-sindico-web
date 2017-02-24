<?php

# === constants
# ==================================================
define("_APP", dirname(__FILE__) . '/app');
define("_SLIM_DEBUG", true);

# === slim
# ==================================================
require 'vendor/autoload.php';
$app = new \Slim\Slim(array(
  'debug' => _SLIM_DEBUG
));

$app->add(new \CorsSlim\CorsSlim());
 /*$app->response()->headers->set('Access-Control-Allow-Headers', 'Content-Type');
 $app->response()->headers->set('Content-Type', 'application/json');
 $app->response()->headers->set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
 $app->response()->headers->set('Access-Control-Allow-Origin', '*');
 */

# === config
# ==================================================
// Database configuration
$db = array(
	'dev_herson'=> array(
		'driver'    => 'mysql',
		'host'      => '172.17.82.33',
		'database'  => 'genericapp',
		'username'  => 'herson.santos',
		'password'  => '1qaz2wsx',
		'charset'   => 'utf8',
		'collation' => 'utf8_unicode_ci',
		'prefix'    => ''
	),
	'dev_claudio'=>array(
		'driver'    => 'mysql',
		'host'      => 'localhost',
		'database'  => 'genericapp',
		'username'  => 'root',
		'password'  => 'root',
		'charset'   => 'utf8',
		'collation' => 'utf8_unicode_ci',
		'prefix'    => ''
	)
);

use Illuminate\Database\Capsule\Manager as Capsule;
$capsule = new Capsule;
$capsule->addConnection( $db['dev_claudio'] );
$capsule->bootEloquent();

# === utils
# ==================================================
require_once _APP . '/utils/utils.php';
# === models
# ==================================================
require_once _APP . "/models/models.php";
# === controllers
# ==================================================
require_once _APP . "/controllers/controllers.php";
# === run slim
$app->run();