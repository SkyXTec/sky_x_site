<?php
/**
 * logout.php — POST /api/auth/logout
 * Invalida o token de sessão no banco de dados.
 */


require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';


header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


// Extrai token do header Authorization: Bearer <token>
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
    $token = $matches[1];
    try {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        $stmt = $pdo->prepare('DELETE FROM skyx_sessions WHERE token = :token');
        $stmt->execute([':token' => $token]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erro ao acessar o banco de dados.']);
        exit;
    }
}

// Sempre retorna sucesso (mesmo que o token já não existisse)
echo json_encode(['success' => true, 'message' => 'Logout realizado.']);
