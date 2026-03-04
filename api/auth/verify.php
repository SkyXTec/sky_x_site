<?php

/**
 * verify.php — GET /api/auth/verify
 * Verifica se o token (enviado no header Authorization) é válido e não expirou.
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Extrai token do header: Authorization: Bearer <token>
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['valid' => false, 'error' => 'Token não fornecido.']);
    exit;
}

$token = $matches[1];

try {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $sql = "SELECT s.token, s.expires_at, u.id, u.username, u.name, u.role, u.active
            FROM skyx_sessions s
            INNER JOIN skyx_users u ON u.id = s.user_id
            WHERE s.token = :token
              AND s.expires_at > NOW()
              AND u.active = 1
            LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':token' => $token]);
    $session = $stmt->fetch();
    if (!$session) {
        http_response_code(401);
        echo json_encode(['valid' => false, 'error' => 'Sessão inválida ou expirada.']);
        exit;
    }
    echo json_encode([
        'valid' => true,
        'user'  => [
            'username' => $session['username'],
            'name'     => $session['name'],
            'role'     => $session['role'],
        ],
        'expires_at' => $session['expires_at'],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['valid' => false, 'error' => 'Erro ao acessar o banco de dados.']);
    exit;
}
