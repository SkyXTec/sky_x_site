
<?php
// contato.php - Recebe mensagens do formulário de contato e salva no banco
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Sanitização básica
function sanitize($str) {
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}

$nome     = isset($_POST['nome'])     ? sanitize($_POST['nome'])     : '';
$email    = isset($_POST['email'])    ? sanitize($_POST['email'])    : '';
$telefone = isset($_POST['telefone']) ? sanitize($_POST['telefone']) : '';
$assunto  = isset($_POST['assunto'])  ? sanitize($_POST['assunto'])  : '';
$mensagem = isset($_POST['mensagem']) ? sanitize($_POST['mensagem']) : '';

if (!$nome || !$email || !$assunto || !$mensagem) {
    http_response_code(400);
    echo json_encode(['error' => 'Preencha todos os campos obrigatórios.']);
    exit;
}


try {
    $pdo = getPDOConnection();
    $stmt = $pdo->prepare("INSERT INTO skyx_mensagens (nome, email, telefone, assunto, mensagem, status, data) VALUES (:nome, :email, :telefone, :assunto, :mensagem, 'unread', NOW())");
    $stmt->execute([
        ':nome'     => $nome,
        ':email'    => $email,
        ':telefone' => $telefone,
        ':assunto'  => $assunto,
        ':mensagem' => $mensagem
    ]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar mensagem.']);
}
