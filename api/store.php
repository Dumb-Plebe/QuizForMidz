<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$data = $input['data'];
$filename = 'stored_data.txt';

// `file_put_contents` is a builtin php command
if (file_put_contents($filename, $data) !== false) {
    echo json_encode(['success' => true, 'message' => 'Data stored successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to store data']);
}
?>