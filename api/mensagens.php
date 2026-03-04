<?php
// mensagens.php - API para listar mensagens de contato
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $pdo = getPDOConnection();
    $sql = "SELECT id, nome, email, telefone, assunto, mensagem, status, data FROM skyx_mensagens ORDER BY data DESC";
    $stmt = $pdo->query($sql);
    $mensagens = $stmt->fetchAll();
    echo json_encode($mensagens);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao buscar mensagens.']);
}
