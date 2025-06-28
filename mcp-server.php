<?php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$prompt = $input['prompt'] ?? '';
$system_prompt = $input['system_prompt'] ?? '';
$images = $input['images'] ?? [];
$language = $input['language'] ?? 'en';
$model = $input['model'] ?? 'mistral';
$memory = $input['memory'] ?? [];

// Compose the conversation for the AI (system, memory, user)
$messages = [];
if ($system_prompt) {
  $messages[] = ['role' => 'system', 'content' => $system_prompt];
}
foreach ($memory as $m) {
  if (!empty($m['content'])) {
    $messages[] = [
      'role' => $m['role'],
      'content' => $m['content']
    ];
  }
}
// Add user prompt with images if present
if (!empty($images)) {
  $msg = [
    ['type' => 'text', 'text' => $prompt]
  ];
  foreach ($images as $img) {
    $msg[] = ['type' => 'image_url', 'image_url' => ['url' => $img]];
  }
  $messages[] = ['role' => 'user', 'content' => $msg];
} else {
  $messages[] = ['role' => 'user', 'content' => $prompt];
}

// Build payload for Pollinations.ai (or your own AI endpoint)
$payload = [
  'model' => $model,
  'messages' => $messages,
  'max_tokens' => 700,
  'temperature' => 0.2,
  'top_p' => 1,
  'stream' => false
];

// Call the AI backend (Pollinations.ai or your own endpoint)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://text.Pollinations.ai/openai");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode === 200 && $response) {
  $data = json_decode($response, true);
  $content = $data['choices'][0]['message']['content'] ?? "No response from model.";
  echo json_encode(['content' => $content]);
} else {
  echo json_encode(['content' => "AI server error."]);
}
?>