<?php
// update_mensagem.php - Atualiza o status de uma mensagem
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;
$status = isset($data['status']) ? $data['status'] : '';

$validStatus = ['unread', 'answered', 'archived'];
if (!$id || !in_array($status, $validStatus)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
    exit;
}

try {
    $pdo = getPDOConnection();
    $stmt = $pdo->prepare('UPDATE skyx_mensagens SET status = :status WHERE id = :id');
    $stmt->execute([':status' => $status, ':id' => $id]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao atualizar mensagem.']);
}
