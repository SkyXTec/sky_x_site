<?php
// get-imagem.php - Serve imagem BLOB do banco de dados
require_once __DIR__ . '/db.php';
$pdo = getPDOConnection();
if (!isset($_GET['id'])) {
    http_response_code(400);
    exit('ID obrigatório');
}
$id = intval($_GET['id']);
$stmt = $pdo->prepare('SELECT nome, tipo, dados FROM skyx_imagens WHERE id = ?');
$stmt->execute([$id]);
$img = $stmt->fetch();
if (!$img) {
    http_response_code(404);
    exit('Imagem não encontrada');
}
header('Content-Type: ' . $img['tipo']);
header('Content-Disposition: inline; filename="' . $img['nome'] . '"');
echo $img['dados'];
