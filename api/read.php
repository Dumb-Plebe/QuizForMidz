<?php

$filename = 'stored_data.txt';

if (file_exists($filename)) {
    $data = file_get_contents($filename);
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    echo json_encode(['success' => true, 'data' => '']);
}
?>