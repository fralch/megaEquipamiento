<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
try {
    $service = app(App\Services\FirebaseNotificationService::class);
    $service->sendToToken('dummy_token', 'Test', 'Body');
    echo "Success: Sent message.\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
