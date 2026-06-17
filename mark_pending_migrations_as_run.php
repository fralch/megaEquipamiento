<?php

/**
 * Script to mark pending migrations as 'Ran' in the migrations table
 * without executing their SQL commands.
 */

// Bootstrap the Laravel application
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $migrator = app('migrator');
    
    // Resolve all migration paths
    $paths = array_unique(array_merge([database_path('migrations')], $migrator->paths()));
    
    // Get all migration files from directories
    $files = $migrator->getMigrationFiles($paths);
    
    // Get list of migrations that have already run
    $ran = $migrator->getRepository()->getRan();
    
    // Determine migrations that are pending
    $pending = array_diff(array_keys($files), $ran);
    
    if (empty($pending)) {
        echo "No pending migrations found. Everything is up to date.\n";
        exit(0);
    }
    
    // Determine the next batch number to group them together
    $batch = $migrator->getRepository()->getNextBatchNumber();
    
    echo "Found " . count($pending) . " pending migrations.\n";
    echo "Using batch number: {$batch}\n";
    echo "Marking migrations as 'Ran' (without executing database structure modifications):\n";
    
    foreach ($pending as $migration) {
        echo " - {$migration} ... ";
        $migrator->getRepository()->log($migration, $batch);
        echo "Marked as Ran.\n";
    }
    
    echo "\nSuccess: All pending migrations have been marked as 'Ran'.\n";
    
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
