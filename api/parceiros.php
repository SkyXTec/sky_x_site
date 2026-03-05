<?php
// parceiros.php — CRUD de logotipos de parceiros
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $pdo    = getPDOConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    // ── GET: listar parceiros ────────────────────────────────────────────────
    if ($method === 'GET') {
        $stmt = $pdo->query(
            'SELECT id, nome, img_id, ordem FROM skyx_parceiros ORDER BY ordem ASC, id ASC'
        );
        $parceiros = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($parceiros as &$p) {
            $p['img_url'] = 'api/get-imagem.php?id=' . $p['img_id'];
        }
        echo json_encode($parceiros);
        exit;
    }

    // ── POST: adicionar parceiro (multipart/form-data) ───────────────────────
    if ($method === 'POST') {
        if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'Imagem obrigatória.']);
            exit;
        }

        $ext     = strtolower(pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        if (!in_array($ext, $allowed)) {
            http_response_code(400);
            echo json_encode(['error' => 'Formato não suportado. Use jpg, png, webp ou svg.']);
            exit;
        }

        $nome    = (isset($_POST['nome']) && trim($_POST['nome']) !== '')
                    ? trim($_POST['nome'])
                    : pathinfo($_FILES['imagem']['name'], PATHINFO_FILENAME);
        $imgData = file_get_contents($_FILES['imagem']['tmp_name']);
        $imgType = mime_content_type($_FILES['imagem']['tmp_name']);
        $imgName = $_FILES['imagem']['name'];

        // Salva imagem no BLOB
        $stmt = $pdo->prepare('INSERT INTO skyx_imagens (nome, tipo, dados) VALUES (?, ?, ?)');
        $stmt->bindParam(1, $imgName);
        $stmt->bindParam(2, $imgType);
        $stmt->bindParam(3, $imgData, PDO::PARAM_LOB);
        $stmt->execute();
        $imgId = $pdo->lastInsertId();

        // Cria registro do parceiro
        $stmt2 = $pdo->prepare('INSERT INTO skyx_parceiros (nome, img_id) VALUES (?, ?)');
        $stmt2->execute([$nome, $imgId]);
        $parceiroId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'id'      => (int) $parceiroId,
            'img_url' => 'api/get-imagem.php?id=' . $imgId,
            'nome'    => $nome,
        ]);
        exit;
    }

    // ── DELETE: remover parceiro ─────────────────────────────────────────────
    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id   = isset($data['id']) ? (int) $data['id'] : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID inválido.']);
            exit;
        }

        // Busca img_id antes de deletar
        $stmt = $pdo->prepare('SELECT img_id FROM skyx_parceiros WHERE id = ?');
        $stmt->execute([$id]);
        $parceiro = $stmt->fetch();

        $stmt2 = $pdo->prepare('DELETE FROM skyx_parceiros WHERE id = ?');
        $stmt2->execute([$id]);

        // Remove imagem associada do banco
        if ($parceiro) {
            $stmt3 = $pdo->prepare('DELETE FROM skyx_imagens WHERE id = ?');
            $stmt3->execute([$parceiro['img_id']]);
        }

        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido.']);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
