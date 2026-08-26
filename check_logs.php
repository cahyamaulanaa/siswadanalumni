<?php
// Check recent laravel logs for errors
$logFile = 'storage/logs/laravel.log';

if (file_exists($logFile)) {
    $lines = file($logFile);
    $recent = array_slice($lines, -100); // Get last 100 lines
    
    echo "=== RECENT LARAVEL LOGS (Last 100 lines) ===\n\n";
    foreach ($recent as $line) {
        echo $line;
    }
} else {
    echo "Log file not found\n";
}
