<?php
header('Content-Type: application/json');

require_once 'config.php';

$accountId = CLOUDFLARE_ACCOUNT_ID;
$apiToken = CLOUDFLARE_API_TOKEN;

$url = "https://api.cloudflare.com/client/v4/accounts/{$accountId}/stream";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$apiToken}",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo $response;
} else {
    http_response_code(500);
    echo json_encode(["error" => "Falha ao buscar vídeos"]);
}
?>