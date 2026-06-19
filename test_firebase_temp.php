<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$s = json_decode(file_get_contents(storage_path('app/firebase/service-account.json')), true);
$res = openssl_pkey_get_private($s['private_key']);
echo $res ? 'KEY IS VALID' : 'ERROR OPENSSL: '.openssl_error_string();
echo "\n";
