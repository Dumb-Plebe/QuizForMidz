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
        "status" => "lobby",
        "music" => false,
        "current_question" => null,
        "players" => [], // "Name" => Score
        "player_status" => [] // "Name" => "active" or "tabbed_out"  <-- NEW
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
            $json['players'][$name] = 0;
            $json['player_status'][$name] = 'active'; // Default to active
        }
        file_put_contents($file, json_encode($json));
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid PIN"]);
    }
    exit;
}

// --- 3. UPDATE GAME (Teacher) ---
if ($action === 'update_game') {
    $pin = $data['pin'];
    $file = getFile($pin);
    if (file_exists($file)) {
        $json = json_decode(file_get_contents($file), true);
        if (isset($data['status'])) $json['status'] = $data['status'];
        if (isset($data['current_question'])) $json['current_question'] = $data['current_question'];
        if (isset($data['music'])) $json['music'] = $data['music'];
        
        file_put_contents($file, json_encode($json));
        echo json_encode(["success" => true]);
    }
    exit;
}

// --- 4. SUBMIT SCORE ---
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

// --- 5. NEW: REPORT FOCUS (Anti-Cheat) ---
if ($action === 'focus') {
    $pin = $data['pin'];
    $name = $data['name'];
    $isTabbedOut = $data['is_tabbed_out']; // true or false
    $file = getFile($pin);
    
    if (file_exists($file)) {
        $json = json_decode(file_get_contents($file), true);
        // Save the status
        $json['player_status'][$name] = $isTabbedOut ? 'tabbed_out' : 'active';
        file_put_contents($file, json_encode($json));
        echo json_encode(["success" => true]);
    }
    exit;
}

// --- 6. GET STATUS ---
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