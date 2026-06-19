<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$productos = DB::table('productos')
    ->whereNotNull('caracteristicas')
    ->where('caracteristicas', '!=', '[]')
    ->where('caracteristicas', '!=', '{}')
    ->inRandomOrder()
    ->limit(5)
    ->get(['id_producto', 'caracteristicas']);

$secuencial = 0;
$asociativo = 0;

foreach ($productos as $prod) {
    $car = json_decode($prod->caracteristicas, true);
    if (!is_array($car) || count($car) === 0) continue;

    $keys = array_keys($car);
    $firstKey = reset($keys);
    $format = is_int($firstKey) ? 'SECUENCIAL' : 'ASOCIATIVO';

    echo "Producto #{$prod->id_producto}: formato={$format}, items=" . count($car);

    $i = 0;
    foreach ($car as $k => $v) {
        if ($i++ >= 2) break;
        $key = is_int($k) ? "#{$k}" : $k;
        $val = is_array($v) ? json_encode($v) : $v;
        echo " [{$key} => {$val}]";
    }
    echo PHP_EOL;

    if ($format === 'SECUENCIAL') $secuencial++;
    else $asociativo++;
}

echo PHP_EOL . "Resumen: {$asociativo} asociativo(s), {$secuencial} secuencial(es)" . PHP_EOL;
