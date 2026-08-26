<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

/**
 * Database Export Script
 * Export SQLite database ke format SQL
 */

$dbPath = __DIR__ . '/database/database.sqlite';
$outputFile = __DIR__ . '/database_export.sql';

echo "Database path: $dbPath\n";
echo "Output file: $outputFile\n";
echo "File exists: " . (file_exists($dbPath) ? "YES" : "NO") . "\n";

if (!file_exists($dbPath)) {
    die("Database file not found: $dbPath\n");
}

try {
    // Koneksi ke SQLite database
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected to database successfully\n";
    
    $output = "-- Database Export\n";
    $output .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
    $output .= "-- Database: sialumni_vmi\n\n";
    
    // Get all tables
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        // Drop table if exists
        $output .= "DROP TABLE IF EXISTS `$table`;\n\n";
        
        // Get CREATE TABLE statement
        $stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='$table'");
        $createTable = $stmt->fetchColumn();
        
        if ($createTable) {
            // Convert SQLite CREATE TABLE to MySQL format
            $createTable = str_replace('AUTOINCREMENT', 'AUTO_INCREMENT', $createTable);
            $output .= $createTable . ";\n\n";
        }
        
        // Get all data
        $stmt = $pdo->query("SELECT * FROM `$table`");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($rows)) {
            $columns = array_keys($rows[0]);
            $columnList = '`' . implode('`, `', $columns) . '`';
            
            foreach ($rows as $row) {
                $values = array_map(function($value) use ($pdo) {
                    if ($value === null) {
                        return 'NULL';
                    }
                    return $pdo->quote($value);
                }, $row);
                
                $output .= "INSERT INTO `$table` ($columnList) VALUES (" . implode(', ', $values) . ");\n";
            }
            $output .= "\n";
        }
    }
    
    // Write to file
    file_put_contents($outputFile, $output);
    
    echo "✓ Database exported successfully to: $outputFile\n";
    echo "File size: " . filesize($outputFile) . " bytes\n";
    echo "Tables exported: " . count($tables) . "\n";
    echo "\nTables:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\n");
}
?>
