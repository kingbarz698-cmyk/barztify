<?php
namespace App\Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    public static function getInstance(): PDO {
        if (self::$instance === null) {

            $host = App::env('DB_HOST');
            $name = App::env('DB_NAME', 'barztify');
            $user = App::env('DB_USER', 'root');
            $pass = App::env('DB_PASS', '');

            // Prefer explicit Cloud SQL instance connection name when running on Cloud Run
            $instanceConn = App::env('INSTANCE_CONNECTION_NAME') ?: getenv('INSTANCE_CONNECTION_NAME') ?: null;

            if ($instanceConn) {
                $socket = '/cloudsql/' . $instanceConn;
                $dsn = "mysql:unix_socket={$socket};dbname={$name};charset=utf8mb4";
            } elseif (str_starts_with((string)$host, '/cloudsql/')) {
                // Support legacy: DB_HOST=/cloudsql/instance-name
                $dsn = "mysql:unix_socket={$host};dbname={$name};charset=utf8mb4";
            } else {
                $port = App::env('DB_PORT', '3306');
                $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
            }

            try {
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                App::error('Database connection failed: ' . $e->getMessage(), 500);
            }
        }

        return self::$instance;
    }
}