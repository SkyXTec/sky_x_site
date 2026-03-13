
<?php
// login.php — POST /api/auth/login
// Recebe { username, password }, valida contra MySQL e retorna token de sessão.


require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

// Headers JSON + CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Aceita apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido.']);
    exit;
}

// Lê body JSON
$body = json_decode(file_get_contents('php://input'), true);

$username = trim($body['username'] ?? '');
$password  = $body['password'] ?? '';

// Validação básica
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Preencha o usuário e a senha.']);
    exit;
}


// Conexão PDO
try {
    $pdo = getPDOConnection();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro de conexão com o banco de dados.']);
    exit;
}


// Busca usuário ativo
$stmt = $pdo->prepare('SELECT id, username, name, role, password_hash FROM skyx_users WHERE username = :username AND active = 1 LIMIT 1');
$stmt->execute([':username' => $username]);
$user = $stmt->fetch();

// DEBUG: log detalhado para diagnóstico
$debug = [];
if (!$user) {
    $debug['motivo'] = 'Usuário não encontrado ou inativo';
} else if (!password_verify($password, $user['password_hash'])) {
    $debug['motivo'] = 'Senha incorreta';
    $debug['username'] = $user['username'];
    $debug['hash'] = $user['password_hash'];
    $debug['senha_digitada'] = $password;
} else {
    $debug['motivo'] = 'OK';
}

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuário ou senha inválidos.', 'debug' => $debug]);
    exit;
}

// Remove sessões expiradas do usuário
// Remove sessões expiradas do usuário
$pdo->prepare('DELETE FROM skyx_sessions WHERE user_id = :uid AND expires_at < NOW()')
    ->execute([':uid' => $user['id']]);

// Gera token seguro (64 chars hex = 256 bits)
$token     = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+' . TOKEN_EXPIRY_HOURS . ' hours'));
$ip        = $_SERVER['REMOTE_ADDR'] ?? null;
$ua        = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

// Salva sessão no banco
$pdo->prepare(
    'INSERT INTO skyx_sessions (user_id, token, expires_at, ip_address, user_agent)
     VALUES (:uid, :token, :exp, :ip, :ua)'
)->execute([
    ':uid'   => $user['id'],
    ':token' => $token,
    ':exp'   => $expiresAt,
    ':ip'    => $ip,
    ':ua'    => $ua,
]);

// Atualiza last_login
$pdo->prepare('UPDATE skyx_users SET last_login = NOW() WHERE id = :id')
    ->execute([':id' => $user['id']]);

// Retorna token e dados básicos do usuário
echo json_encode([
    'success'    => true,
    'token'      => $token,
    'expires_at' => $expiresAt,
    'user'       => [
        'username' => $user['username'],
        'name'     => $user['name'],
        'role'     => $user['role'],
    ],
]);
return;
