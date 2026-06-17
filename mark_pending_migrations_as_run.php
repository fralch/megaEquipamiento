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
use Illuminate\Support\Facades\Schema;

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
    
    echo "Found " . count($pending) . " pending migrations.\n\n";
    
    $toMark = [];
    $toSkip = [];
    
    foreach ($pending as $migrationName) {
        $filePath = $files[$migrationName];
        $content = file_get_contents($filePath);
        
        // Extract Schema::create(...)
        preg_match_all('/Schema\s*::\s*create\s*\(\s*[\'"]([^\'"]+)[\'"]/', $content, $createMatches);
        $createdTables = array_unique($createMatches[1] ?? []);
        
        // Extract Schema::table(...)
        preg_match_all('/Schema\s*::\s*table\s*\(\s*[\'"]([^\'"]+)[\'"]/', $content, $tableMatches);
        $alteredTables = array_unique($tableMatches[1] ?? []);
        
        // Detect columns added inside the migration file
        $columnTypes = 'string|text|integer|bigInteger|unsignedBigInteger|decimal|boolean|timestamp|date|dateTime|enum|json|float|double|char|tinyInteger|smallInteger|mediumInteger|binary|uuid|ipAddress|macAddress';
        preg_match_all('/\$table->(?:' . $columnTypes . ')\s*\(\s*[\'"]([^\'"]+)[\'"]/', $content, $columnMatches);
        $columns = array_unique($columnMatches[1] ?? []);
        
        $shouldMark = false;
        $reason = '';
        
        if (!empty($createdTables)) {
            // Check if all created tables exist
            $existing = [];
            foreach ($createdTables as $table) {
                if (Schema::hasTable($table)) {
                    $existing[] = $table;
                }
            }
            if (count($existing) === count($createdTables)) {
                $shouldMark = true;
                $reason = "Creates table(s) that already exist: " . implode(', ', $existing);
            } else {
                $reason = "Creates table(s) that do not exist: " . implode(', ', array_diff($createdTables, $existing));
            }
        } elseif (!empty($alteredTables)) {
            // Check if altered tables exist and if columns (if any) already exist
            $tableExists = true;
            foreach ($alteredTables as $table) {
                if (!Schema::hasTable($table)) {
                    $tableExists = false;
                    break;
                }
            }
            
            if ($tableExists) {
                if (!empty($columns)) {
                    $existingCols = [];
                    foreach ($alteredTables as $table) {
                        foreach ($columns as $col) {
                            if (Schema::hasColumn($table, $col)) {
                                $existingCols[] = "{$table}.{$col}";
                            }
                        }
                    }
                    if (count($existingCols) > 0) {
                        // If any targeted columns already exist, we should mark as run to avoid errors
                        $shouldMark = true;
                        $reason = "Alters table(s) that exist, and column(s) already exist: " . implode(', ', $existingCols);
                    } else {
                        $reason = "Alters table(s) but columns do not exist yet.";
                    }
                } else {
                    // Table exists but no specific columns detected in pattern
                    $shouldMark = true;
                    $reason = "Alters table(s) that exist (no new columns detected).";
                }
            } else {
                $reason = "Alters table(s) that do not exist.";
            }
        } else {
            // No schema modification detected (e.g. data-only migration)
            if (strpos($migrationName, 'normalize_existing_product_features') !== false) {
                $shouldMark = true;
                $reason = "Data migration (normalize_existing_product_features) - product features are already normalized in the DB.";
            } else {
                $reason = "No Schema changes detected (data or config migration). Skipping by default.";
            }
        }
        
        if ($shouldMark) {
            $toMark[$migrationName] = $reason;
        } else {
            $toSkip[$migrationName] = $reason;
        }
    }
    
    if (empty($toMark)) {
        echo "No migrations match the criteria (tables/columns already existing).\n";
        if (!empty($toSkip)) {
            echo "\nSkipped migrations:\n";
            foreach ($toSkip as $migration => $reason) {
                echo " - {$migration} ({$reason})\n";
            }
        }
        exit(0);
    }
    
    echo "Using batch number: {$batch}\n";
    echo "Marking the following migrations as 'Ran' (without executing structure modifications):\n";
    foreach ($toMark as $migration => $reason) {
        echo " - {$migration}\n   Reason: {$reason}\n";
    }
    
    if (!empty($toSkip)) {
        echo "\nThe following migrations will NOT be marked (will remain pending):\n";
        foreach ($toSkip as $migration => $reason) {
            echo " - {$migration}\n   Reason: {$reason}\n";
        }
    }
    
    echo "\nProcessing...\n";
    foreach (array_keys($toMark) as $migration) {
        echo " - {$migration} ... ";
        $migrator->getRepository()->log($migration, $batch);
        echo "Marked as Ran.\n";
    }
    
    echo "\nSuccess: Selected migrations have been marked as 'Ran'.\n";
    
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
