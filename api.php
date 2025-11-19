<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

function getFile($pin) {
    $cleanPin = preg_replace('/[^0-9]/', '', $pin);
    return "sessions/game_" . $cleanPin . ".json";
}

// --- 1. CREATE GAME ---
if ($action === 'create') {
    $pin = rand(100000, 999999);
    $gameState = [
        "pin" => $pin,
        "status" => "lobby", // lobby, active, leaderboard
        "current_question" => null, // Stores the text/options
        "players" => [] // "Name" => Score
    ];
    file_put_contents(getFile($pin), json_encode($gameState));
    echo json_encode(["success" => true, "pin" => $pin]);
    exit;
}

// --- 2. JOIN GAME ---
if ($action === 'join') {
    $pin = $data['pin'];
    $name = htmlspecialchars($data['name']);
    $file = getFile($pin);

    if (file_exists($file)) {
        $json = json_decode(file_get_contents($file), true);
        if (!isset($json['players'][$name])) {
            $json['players'][$name] = 0; // Start with 0 points
        }
        file_put_contents($file, json_encode($json));
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid PIN"]);
    }
    exit;
}

// --- 3. UPDATE GAME (Teacher sends Question) ---
if ($action === 'update_game') {
    $pin = $data['pin'];
    $file = getFile($pin);
    if (file_exists($file)) {
        $json = json_decode(file_get_contents($file), true);
        
        // Update status and question data
        if (isset($data['status'])) $json['status'] = $data['status'];
        if (isset($data['current_question'])) $json['current_question'] = $data['current_question'];
        
        file_put_contents($file, json_encode($json));
        echo json_encode(["success" => true]);
    }
    exit;
}

// --- 4. SUBMIT SCORE (Student answers right) ---
if ($action === 'score') {
    $pin = $data['pin'];
    $name = $data['name'];
    $points = $data['points'];
    $file = getFile($pin);

    if (file_exists($file)) {
        $json = json_decode(file_get_contents($file), true);
        if (isset($json['players'][$name])) {
            $json['players'][$name] += $points;
        }
        file_put_contents($file, json_encode($json));
        echo json_encode(["success" => true]);
    }
    exit;
}

// --- 5. GET STATUS (Polling) ---
if ($action === 'status') {
    $pin = $_GET['pin'];
    $file = getFile($pin);
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode(["error" => "Session not found"]);
    }
    exit;
}
?>