<?php
// noticias.php - API para CRUD de notícias (sem DELETE)
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getPDOConnection();

    if ($method === 'GET') {
        // Listar todas as notícias ou buscar por id/slug
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare('SELECT * FROM skyx_noticias WHERE id = ?');
            $stmt->execute([$_GET['id']]);
            $noticia = $stmt->fetch();
            echo json_encode($noticia ?: []);
        } else if (isset($_GET['slug'])) {
            $stmt = $pdo->prepare('SELECT * FROM skyx_noticias WHERE slug = ?');
            $stmt->execute([$_GET['slug']]);
            $noticia = $stmt->fetch();
            echo json_encode($noticia ?: []);
        } else if (isset($_GET['destaque']) && $_GET['destaque'] === 'all') {
            $stmt = $pdo->query('SELECT * FROM skyx_noticias ORDER BY FIELD(destaque, "destaque1", "destaque2", "destaque3"), data_publicacao DESC');
            $noticias = $stmt->fetchAll();
            echo json_encode($noticias);
        } else {
            $stmt = $pdo->query('SELECT * FROM skyx_noticias ORDER BY data_publicacao DESC');
            $noticias = $stmt->fetchAll();
            echo json_encode($noticias);
        }
        exit;
    }

    if ($method === 'POST') {
        // Criar nova notícia
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) throw new Exception('Dados inválidos');
        $sql = 'INSERT INTO skyx_noticias (titulo, slug, resumo, conteudo_html, capa_url, imagens_json, tags, destaque, status, data_publicacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['titulo'],
            $data['slug'],
            $data['resumo'] ?? null,
            $data['conteudo_html'],
            $data['capa_url'] ?? null,
            $data['imagens_json'] ?? null,
            $data['tags'] ?? null,
            $data['destaque'] ?? 'none',
            $data['status'] ?? 'publicada',
            $data['data_publicacao'] ?? date('Y-m-d H:i:s')
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($method === 'PUT') {
        // Editar notícia existente
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['id'])) throw new Exception('ID obrigatório');
        // Só atualizar status se vier APENAS id e status no JSON
        if (isset($data['status']) && count($data) === 2 && isset($data['id'])) {
            $stmt = $pdo->prepare('UPDATE skyx_noticias SET status=? WHERE id=?');
            $stmt->execute([$data['status'], $data['id']]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Nenhuma linha atualizada. ID pode estar incorreto ou status já era esse.']);
            }
            exit;
        }
        $sql = 'UPDATE skyx_noticias SET titulo=?, slug=?, resumo=?, conteudo_html=?, capa_url=?, imagens_json=?, tags=?, destaque=?, status=?, data_publicacao=? WHERE id=?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['titulo'],
            $data['slug'],
            $data['resumo'] ?? null,
            $data['conteudo_html'],
            $data['capa_url'] ?? null,
            $data['imagens_json'] ?? null,
            $data['tags'] ?? null,
            $data['destaque'] ?? 'none',
            $data['status'] ?? 'publicada',
            $data['data_publicacao'] ?? date('Y-m-d H:i:s'),
            $data['id']
        ]);
        echo json_encode(['success' => true]);
        exit;
    }

    // DELETE não implementado
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
