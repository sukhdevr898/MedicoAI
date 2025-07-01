<?php
/**
 * Medico AI - MCP Server Endpoint
 * Enhanced PHP server for handling AI requests via URL endpoints
 * Created by Sukhdev Singh
 * 
 * Supports:
 * - GET requests with URL parameters
 * - POST requests with JSON payload
 * - Multiple AI models via Pollinations.ai
 * - Image analysis and vision capabilities
 * - Medical education focused responses
 */

// Enhanced CORS and security headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');
header('X-Powered-By: Medico-AI-MCP-Server');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Input validation and sanitization
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function validateModel($model) {
    $validModels = [
        'openai', 'openai-large', 'gemini', 'mistral', 'qwen-coder', 
        'deepseek', 'deepseek-reasoning', 'phi', 'llama', 'llamascout'
    ];
    return in_array($model, $validModels) ? $model : 'openai';
}

// Get request method and handle accordingly
$method = $_SERVER['REQUEST_METHOD'];
$requestData = [];

try {
    if ($method === 'GET') {
        // Handle GET requests with URL parameters
        // Example: /mcp-server.php?prompt=Hello&model=openai&system=medical_prompt
        
        $requestData = [
            'prompt' => $_GET['prompt'] ?? $_GET['q'] ?? '',
            'system_prompt' => $_GET['system_prompt'] ?? $_GET['system'] ?? '',
            'model' => $_GET['model'] ?? 'openai',
            'language' => $_GET['language'] ?? $_GET['lang'] ?? 'en',
            'temperature' => floatval($_GET['temperature'] ?? 0.2),
            'max_tokens' => intval($_GET['max_tokens'] ?? 700),
            'images' => isset($_GET['images']) ? explode(',', $_GET['images']) : [],
            'memory' => isset($_GET['memory']) ? json_decode($_GET['memory'], true) : []
        ];
        
        // Handle URL-encoded prompts
        if (empty($requestData['prompt'])) {
            // Try to get prompt from URL path
            $pathInfo = $_SERVER['PATH_INFO'] ?? '';
            if (!empty($pathInfo)) {
                $requestData['prompt'] = urldecode(ltrim($pathInfo, '/'));
            }
        }
        
    } elseif ($method === 'POST') {
        // Handle POST requests with JSON payload
        $jsonInput = file_get_contents('php://input');
        $decodedInput = json_decode($jsonInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON payload: ' . json_last_error_msg());
        }
        
        $requestData = [
            'prompt' => $decodedInput['prompt'] ?? '',
            'system_prompt' => $decodedInput['system_prompt'] ?? '',
            'model' => $decodedInput['model'] ?? 'openai',
            'language' => $decodedInput['language'] ?? 'en',
            'temperature' => floatval($decodedInput['temperature'] ?? 0.2),
            'max_tokens' => intval($decodedInput['max_tokens'] ?? 700),
            'images' => $decodedInput['images'] ?? [],
            'memory' => $decodedInput['memory'] ?? []
        ];
        
    } else {
        throw new Exception('Unsupported HTTP method: ' . $method);
    }
    
    // Validate and sanitize inputs
    $prompt = sanitizeInput($requestData['prompt']);
    $system_prompt = sanitizeInput($requestData['system_prompt']);
    $model = validateModel($requestData['model']);
    $language = sanitizeInput($requestData['language']);
    $temperature = max(0.0, min(2.0, $requestData['temperature']));
    $max_tokens = max(1, min(2000, $requestData['max_tokens']));
    $images = is_array($requestData['images']) ? $requestData['images'] : [];
    $memory = is_array($requestData['memory']) ? $requestData['memory'] : [];
    
    // Validate required fields
    if (empty($prompt)) {
        throw new Exception('Prompt is required');
    }
    
    // Generate default medical system prompt if none provided
    if (empty($system_prompt)) {
        $system_prompt = "You are Medico AI, an advanced medical assistant specializing in medical education and healthcare guidance. " .
                        "You provide detailed, evidence-based medical knowledge for educational purposes only. " .
                        "Always recommend consulting qualified healthcare professionals for patient care. " .
                        "Respond in a clear, educational manner appropriate for medical students and healthcare professionals.";
    }
    
    // Build conversation messages
    $messages = [];
    
    // Add system prompt
    if (!empty($system_prompt)) {
        $messages[] = ['role' => 'system', 'content' => $system_prompt];
    }
    
    // Add conversation memory
    foreach ($memory as $msg) {
        if (!empty($msg['content']) && !empty($msg['role'])) {
            $messages[] = [
                'role' => sanitizeInput($msg['role']),
                'content' => sanitizeInput($msg['content'])
            ];
        }
    }
    
    // Add current user prompt with images if present
    if (!empty($images)) {
        $content = [['type' => 'text', 'text' => $prompt]];
        foreach ($images as $img) {
            if (filter_var($img, FILTER_VALIDATE_URL)) {
                $content[] = ['type' => 'image_url', 'image_url' => ['url' => $img]];
            }
        }
        $messages[] = ['role' => 'user', 'content' => $content];
    } else {
        $messages[] = ['role' => 'user', 'content' => $prompt];
    }
    
    // Prepare payload for Pollinations.ai
    $payload = [
        'model' => $model,
        'messages' => $messages,
        'max_tokens' => $max_tokens,
        'temperature' => $temperature,
        'top_p' => 1,
        'stream' => false
    ];
    
    // Add language-specific system message if needed
    if ($language !== 'en') {
        $languageNames = [
            'es' => 'Spanish', 'fr' => 'French', 'de' => 'German', 
            'it' => 'Italian', 'pt' => 'Portuguese', 'ru' => 'Russian',
            'ja' => 'Japanese', 'ko' => 'Korean', 'zh' => 'Chinese'
        ];
        $langName = $languageNames[$language] ?? 'English';
        $payload['messages'][0]['content'] .= " Please respond in {$langName}.";
    }
    
    // Log request for debugging (remove in production)
    error_log("MCP Server Request - Model: {$model}, Prompt length: " . strlen($prompt));
    
    // Make API call to Pollinations.ai
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://text.pollinations.ai/openai",
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'User-Agent: Medico-AI-MCP-Server/1.0'
        ],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        throw new Exception("Network error: " . $curlError);
    }
    
    if ($httpCode !== 200) {
        throw new Exception("API error: HTTP {$httpCode}");
    }
    
    if (!$response) {
        throw new Exception("Empty response from AI service");
    }
    
    // Parse and validate response
    $responseData = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON response from AI service");
    }
    
    $content = $responseData['choices'][0]['message']['content'] ?? 
               $responseData['content'] ?? 
               "No response content available";
    
    // Successful response
    $result = [
        'success' => true,
        'content' => $content,
        'model' => $model,
        'timestamp' => date('c'),
        'usage' => [
            'prompt_tokens' => strlen($prompt),
            'completion_tokens' => strlen($content),
            'total_tokens' => strlen($prompt) + strlen($content)
        ]
    ];
    
    // Add method info for debugging
    if (isset($_GET['debug']) && $_GET['debug'] === '1') {
        $result['debug'] = [
            'method' => $method,
            'model_used' => $model,
            'language' => $language,
            'temperature' => $temperature,
            'max_tokens' => $max_tokens,
            'has_images' => !empty($images),
            'memory_count' => count($memory)
        ];
    }
    
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    // Error handling
    http_response_code(400);
    
    $errorResponse = [
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c'),
        'method' => $method ?? 'unknown'
    ];
    
    // Add debug info if requested
    if (isset($_GET['debug']) && $_GET['debug'] === '1') {
        $errorResponse['debug'] = [
            'request_data' => $requestData ?? [],
            'server_info' => [
                'php_version' => PHP_VERSION,
                'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
            ]
        ];
    }
    
    echo json_encode($errorResponse, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
    // Log error for server monitoring
    error_log("MCP Server Error: " . $e->getMessage());
}

/**
 * Usage Examples:
 * 
 * GET request with URL parameters:
 * /mcp-server.php?prompt=What is hypertension?&model=openai&system=medical_education
 * 
 * GET request with URL path:
 * /mcp-server.php/What is diabetes?
 * 
 * POST request with JSON:
 * POST /mcp-server.php
 * Content-Type: application/json
 * {
 *   "prompt": "Explain cardiac cycle",
 *   "model": "gemini",
 *   "system_prompt": "Medical education assistant",
 *   "memory": [
 *     {"role": "user", "content": "Previous question"},
 *     {"role": "assistant", "content": "Previous answer"}
 *   ]
 * }
 */
?>