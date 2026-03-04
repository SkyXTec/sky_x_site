<?php
// upload-imagem.php - endpoint para upload de imagem de capa
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido.']);
        exit;
    }

    if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Arquivo inválido.']);
        exit;
    }

    $ext = pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION);
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array(strtolower($ext), $allowed)) {
        http_response_code(400);
        echo json_encode(['error' => 'Formato não suportado.']);
        exit;
    }

    // Salvar imagem no banco de dados (campo BLOB)
    $pdo = require_once __DIR__ . '/db.php';
    $pdo = getPDOConnection();
    $imgData = file_get_contents($_FILES['imagem']['tmp_name']);
    $imgType = mime_content_type($_FILES['imagem']['tmp_name']);
    $imgName = $_FILES['imagem']['name'];
    $stmt = $pdo->prepare('INSERT INTO skyx_imagens (nome, tipo, dados) VALUES (?, ?, ?)');
    $stmt->bindParam(1, $imgName);
    $stmt->bindParam(2, $imgType);
    $stmt->bindParam(3, $imgData, PDO::PARAM_LOB);
    $stmt->execute();
    $imgId = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'img_id' => $imgId]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
