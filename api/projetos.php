<?php
// api/projetos.php — CRUD de projetos do portfólio e galeria de mídias
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $pdo    = getPDOConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    // ── DELETE galeria item: DELETE ?galeria_item=X ──────────────────────────
    if ($method === 'DELETE' && isset($_GET['galeria_item'])) {
        $itemId = (int) $_GET['galeria_item'];
        if ($itemId <= 0) { respond(400, ['error' => 'ID inválido.']); }

        $stmt = $pdo->prepare('SELECT img_id FROM skyx_projeto_galeria WHERE id = ?');
        $stmt->execute([$itemId]);
        $item = $stmt->fetch();

        $pdo->prepare('DELETE FROM skyx_projeto_galeria WHERE id = ?')->execute([$itemId]);

        if ($item && $item['img_id']) {
            $pdo->prepare('DELETE FROM skyx_imagens WHERE id = ?')->execute([$item['img_id']]);
        }
        echo json_encode(['success' => true]);
        exit;
    }

    // ── POST galeria item: POST ?galeria=projetoId ───────────────────────────
    if ($method === 'POST' && isset($_GET['galeria'])) {
        $projetoId = (int) $_GET['galeria'];
        if ($projetoId <= 0) { respond(400, ['error' => 'projeto_id inválido.']); }

        $ct = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($ct, 'application/json') !== false) {
            // Vídeo via URL
            $data     = json_decode(file_get_contents('php://input'), true) ?? [];
            $videoUrl = trim($data['video_url'] ?? '');
            if (empty($videoUrl)) { respond(400, ['error' => 'video_url obrigatório.']); }

            $stmt = $pdo->prepare(
                'INSERT INTO skyx_projeto_galeria (projeto_id, tipo, video_url) VALUES (?, ?, ?)'
            );
            $stmt->execute([$projetoId, 'video', $videoUrl]);
            echo json_encode(['success' => true, 'id' => (int) $pdo->lastInsertId(), 'tipo' => 'video', 'url' => $videoUrl]);
        } else {
            // Imagem via upload
            if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
                respond(400, ['error' => 'Imagem inválida ou não enviada.']);
            }
            $imgId = uploadImagem($pdo, $_FILES['imagem']);
            $stmt  = $pdo->prepare(
                'INSERT INTO skyx_projeto_galeria (projeto_id, tipo, img_id) VALUES (?, ?, ?)'
            );
            $stmt->execute([$projetoId, 'imagem', $imgId]);
            echo json_encode([
                'success' => true,
                'id'      => (int) $pdo->lastInsertId(),
                'tipo'    => 'imagem',
                'url'     => 'api/get-imagem.php?id=' . $imgId,
            ]);
        }
        exit;
    }

    // ── GET: listar ou buscar por ID ─────────────────────────────────────────
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $id   = (int) $_GET['id'];
            $stmt = $pdo->prepare('SELECT * FROM skyx_projetos WHERE id = ?');
            $stmt->execute([$id]);
            $p = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$p) { respond(404, ['error' => 'Projeto não encontrado.']); }
            echo json_encode(enrichProject($pdo, $p));
            exit;
        }

        // Lista completa (com ?admin=1 mostra arquivados)
        $admin = (($_GET['admin'] ?? '') === '1');
        if ($admin) {
            $stmt = $pdo->query('SELECT * FROM skyx_projetos ORDER BY ordem ASC, id ASC');
        } else {
            $stmt = $pdo->prepare(
                'SELECT * FROM skyx_projetos WHERE status = ? ORDER BY ordem ASC, id ASC'
            );
            $stmt->execute(['publicado']);
        }
        $projetos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(array_map(fn($p) => enrichProject($pdo, $p), $projetos));
        exit;
    }

    // ── POST: criar ou atualizar projeto (suporte a multipart) ───────────────
    if ($method === 'POST') {
        $nome = trim($_POST['nome'] ?? '');
        if (empty($nome)) { respond(400, ['error' => 'Nome do projeto é obrigatório.']); }

        $id       = isset($_POST['id']) ? (int) $_POST['id'] : null;
        $cliente  = trim($_POST['cliente'] ?? '') ?: null;
        $ano      = !empty($_POST['ano']) ? (int) $_POST['ano'] : null;
        $label    = trim($_POST['label'] ?? '') ?: 'Projeto';
        $descricao = trim($_POST['descricao'] ?? '') ?: null;
        $detalhes  = trim($_POST['detalhes'] ?? '') ?: null;
        $status   = in_array($_POST['status'] ?? '', ['publicado', 'arquivado'])
                        ? $_POST['status'] : 'publicado';
        $ordem    = (int) ($_POST['ordem'] ?? 0);

        $capaId = null;
        if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
            $capaId = uploadImagem($pdo, $_FILES['imagem']);
        }

        if ($id) {
            // UPDATE
            $fields = ['nome=?','cliente=?','ano=?','label=?','descricao=?','detalhes=?','status=?','ordem=?'];
            $params = [$nome, $cliente, $ano, $label, $descricao, $detalhes, $status, $ordem];
            if ($capaId) { $fields[] = 'capa_id=?'; $params[] = $capaId; }
            $params[] = $id;
            $pdo->prepare('UPDATE skyx_projetos SET ' . implode(',', $fields) . ' WHERE id=?')
                ->execute($params);
        } else {
            // INSERT
            $pdo->prepare(
                'INSERT INTO skyx_projetos (nome,cliente,ano,label,descricao,detalhes,capa_id,status,ordem)
                 VALUES (?,?,?,?,?,?,?,?,?)'
            )->execute([$nome, $cliente, $ano, $label, $descricao, $detalhes, $capaId, $status, $ordem]);
            $id = (int) $pdo->lastInsertId();
        }

        $stmt = $pdo->prepare('SELECT * FROM skyx_projetos WHERE id=?');
        $stmt->execute([$id]);
        $projeto = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'projeto' => enrichProject($pdo, $projeto)]);
        exit;
    }

    // ── PUT: atualizar somente status (sem arquivo) ───────────────────────────
    if ($method === 'PUT') {
        $data   = json_decode(file_get_contents('php://input'), true) ?? [];
        $id     = (int) ($data['id'] ?? 0);
        $status = $data['status'] ?? null;
        if ($id <= 0) { respond(400, ['error' => 'ID inválido.']); }
        if (!in_array($status, ['publicado', 'arquivado'])) { respond(400, ['error' => 'Status inválido.']); }

        $pdo->prepare('UPDATE skyx_projetos SET status=? WHERE id=?')->execute([$status, $id]);
        echo json_encode(['success' => true]);
        exit;
    }

    // ── DELETE: excluir projeto ───────────────────────────────────────────────
    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $id   = (int) ($data['id'] ?? 0);
        if ($id <= 0) { respond(400, ['error' => 'ID inválido.']); }

        // Salva capa_id para limpeza
        $stmt = $pdo->prepare('SELECT capa_id FROM skyx_projetos WHERE id=?');
        $stmt->execute([$id]);
        $projeto = $stmt->fetch();

        $pdo->prepare('DELETE FROM skyx_projetos WHERE id=?')->execute([$id]);

        if ($projeto && $projeto['capa_id']) {
            $pdo->prepare('DELETE FROM skyx_imagens WHERE id=?')->execute([$projeto['capa_id']]);
        }
        echo json_encode(['success' => true]);
        exit;
    }

    respond(405, ['error' => 'Método não permitido.']);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function enrichProject(PDO $pdo, array $p): array
{
    $p['capa_url'] = $p['capa_id'] ? 'api/get-imagem.php?id=' . $p['capa_id'] : null;

    $stmt = $pdo->prepare(
        'SELECT id, tipo, img_id, video_url, ordem
           FROM skyx_projeto_galeria
          WHERE projeto_id = ?
          ORDER BY ordem ASC, id ASC'
    );
    $stmt->execute([$p['id']]);
    $galeria = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $p['galeria'] = array_map(function ($g) {
        $g['url'] = ($g['tipo'] === 'imagem' && $g['img_id'])
            ? 'api/get-imagem.php?id=' . $g['img_id']
            : ($g['video_url'] ?? null);
        return $g;
    }, $galeria);

    return $p;
}

function uploadImagem(PDO $pdo, array $file): int
{
    $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($ext, $allowed)) {
        throw new RuntimeException('Formato de imagem não suportado (use jpg, png ou webp).');
    }
    $imgData = file_get_contents($file['tmp_name']);
    $imgType = mime_content_type($file['tmp_name']);
    $imgName = $file['name'];

    $stmt = $pdo->prepare('INSERT INTO skyx_imagens (nome, tipo, dados) VALUES (?, ?, ?)');
    $stmt->bindParam(1, $imgName);
    $stmt->bindParam(2, $imgType);
    $stmt->bindParam(3, $imgData, PDO::PARAM_LOB);
    $stmt->execute();
    return (int) $pdo->lastInsertId();
}

function respond(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body);
    exit;
}
