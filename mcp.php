<?php
/**
 * Medico AI - Enhanced MCP PHP Server
 * Advanced medical AI server with route-based URL endpoint handling
 * Created by Sukhdev Singh
 * 
 * Features:
 * - REST API endpoints with multiple routes
 * - GET/POST request handling with URL parameters
 * - Medical AI specialization with multiple models
 * - Image analysis and vision capabilities
 * - Conversation memory management
 * - Multi-language support
 * - Enhanced error handling and logging
 */

// Enhanced CORS and security headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-API-Key');
header('Content-Type: application/json; charset=utf-8');
header('X-Powered-By: Medico-AI-MCP-Enhanced/2.0');
header('X-API-Version: 2.0');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Utility functions
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function validateModel($model) {
    $validModels = [
        'openai' => 'OpenAI GPT-4',
        'openai-large' => 'OpenAI GPT-4 Large',
        'gemini' => 'Google Gemini Pro',
        'mistral' => 'Mistral Large',
        'qwen-coder' => 'Qwen Coder',
        'deepseek' => 'DeepSeek Chat',
        'deepseek-reasoning' => 'DeepSeek Reasoning',
        'phi' => 'Microsoft Phi',
        'llama' => 'Meta Llama',
        'llamascout' => 'Llama Scout'
    ];
    return array_key_exists($model, $validModels) ? $model : 'openai';
}

function logRequest($method, $endpoint, $model, $promptLength) {
    $logEntry = date('Y-m-d H:i:s') . " - {$method} {$endpoint} - Model: {$model} - Prompt: {$promptLength} chars\n";
    error_log($logEntry, 3, 'mcp_access.log');
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

function sendError($message, $code = 400, $details = []) {
    $error = [
        'success' => false,
        'error' => $message,
        'error_code' => $code,
        'timestamp' => date('c'),
        'request_id' => uniqid('mcp_', true)
    ];
    
    if (!empty($details)) {
        $error['details'] = $details;
    }
    
    error_log("MCP Error [{$code}]: {$message}");
    sendResponse($error, $code);
}

// Route handling
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'] ?? '/';
$query = $parsedUrl['query'] ?? '';

// Parse route
$pathParts = array_filter(explode('/', $path));
$endpoint = end($pathParts) ?: 'mcp.php';

// Initialize request data
$requestData = [];

try {
    // Route-based handling
    switch ($method) {
        case 'GET':
            // Handle various GET endpoint patterns
            
            // Pattern 1: /mcp.php?prompt=question&model=openai
            if (!empty($_GET['prompt']) || !empty($_GET['q'])) {
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
            }
            // Pattern 2: /mcp.php/ask/What is diabetes?
            elseif (count($pathParts) >= 2 && in_array($pathParts[count($pathParts)-2], ['ask', 'query', 'prompt'])) {
                $prompt = urldecode(end($pathParts));
                $requestData = [
                    'prompt' => $prompt,
                    'system_prompt' => $_GET['system'] ?? '',
                    'model' => $_GET['model'] ?? 'openai',
                    'language' => $_GET['lang'] ?? 'en',
                    'temperature' => floatval($_GET['temperature'] ?? 0.2),
                    'max_tokens' => intval($_GET['max_tokens'] ?? 700),
                    'images' => [],
                    'memory' => []
                ];
            }
            // Pattern 3: /mcp.php/model/openai/What is hypertension?
            elseif (count($pathParts) >= 3 && $pathParts[count($pathParts)-3] === 'model') {
                $model = $pathParts[count($pathParts)-2];
                $prompt = urldecode(end($pathParts));
                $requestData = [
                    'prompt' => $prompt,
                    'system_prompt' => $_GET['system'] ?? '',
                    'model' => $model,
                    'language' => $_GET['lang'] ?? 'en',
                    'temperature' => floatval($_GET['temperature'] ?? 0.2),
                    'max_tokens' => intval($_GET['max_tokens'] ?? 700),
                    'images' => [],
                    'memory' => []
                ];
            }
            // Pattern 4: Health endpoint /mcp.php/health
            elseif (end($pathParts) === 'health') {
                sendResponse([
                    'success' => true,
                    'status' => 'healthy',
                    'service' => 'Medico AI MCP Server',
                    'version' => '2.0',
                    'uptime' => time(),
                    'supported_models' => array_keys(validateModel('dummy') ? [] : [
                        'openai', 'gemini', 'mistral', 'deepseek', 'llama'
                    ]),
                    'endpoints' => [
                        'GET /mcp.php?prompt=<question>',
                        'GET /mcp.php/ask/<question>',
                        'GET /mcp.php/model/<model>/<question>',
                        'POST /mcp.php (JSON payload)',
                        'GET /mcp.php/health'
                    ]
                ]);
            }
            else {
                throw new Exception('Invalid GET request format. Use ?prompt=<question> or /ask/<question>');
            }
            break;
            
        case 'POST':
            // Handle POST requests with JSON payload
            $jsonInput = file_get_contents('php://input');
            
            if (empty($jsonInput)) {
                throw new Exception('Empty POST payload');
            }
            
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
                'memory' => $decodedInput['memory'] ?? [],
                'stream' => $decodedInput['stream'] ?? false
            ];
            break;
            
        case 'PUT':
        case 'DELETE':
            sendError('Method not supported yet', 405);
            break;
            
        default:
            throw new Exception('Unsupported HTTP method: ' . $method);
    }
    
    // Validate and sanitize inputs
    $prompt = sanitizeInput($requestData['prompt'] ?? '');
    $system_prompt = sanitizeInput($requestData['system_prompt'] ?? '');
    $model = validateModel($requestData['model'] ?? 'openai');
    $language = sanitizeInput($requestData['language'] ?? 'en');
    $temperature = max(0.0, min(2.0, floatval($requestData['temperature'] ?? 0.2)));
    $max_tokens = max(1, min(2000, intval($requestData['max_tokens'] ?? 700)));
    $images = is_array($requestData['images'] ?? []) ? $requestData['images'] : [];
    $memory = is_array($requestData['memory'] ?? []) ? $requestData['memory'] : [];
    $stream = $requestData['stream'] ?? false;
    
    // Validate required fields
    if (empty($prompt)) {
        throw new Exception('Prompt is required');
    }
    
    if (strlen($prompt) > 10000) {
        throw new Exception('Prompt too long (max 10000 characters)');
    }
    
    // Generate medical-focused system prompt if none provided
    if (empty($system_prompt)) {
        $medicalPrompts = [
            'en' => "You are Medico AI, an advanced medical education assistant. Provide evidence-based, educational medical information suitable for healthcare students and professionals. Always emphasize consulting qualified healthcare providers for patient care decisions.",
            'es' => "Eres Medico AI, un asistente médico educativo avanzado. Proporciona información médica educativa basada en evidencia.",
            'fr' => "Vous êtes Medico AI, un assistant médical éducatif avancé. Fournissez des informations médicales éducatives fondées sur des preuves.",
            'de' => "Sie sind Medico AI, ein fortgeschrittener medizinischer Bildungsassistent. Stellen Sie evidenzbasierte medizinische Bildungsinformationen bereit."
        ];
        $system_prompt = $medicalPrompts[$language] ?? $medicalPrompts['en'];
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
    
    // Add current user prompt with images
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
        'stream' => $stream
    ];
    
    // Log request
    logRequest($method, $endpoint, $model, strlen($prompt));
    
    // Make API call to Pollinations.ai
    $startTime = microtime(true);
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://text.pollinations.ai/openai",
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 45,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'User-Agent: Medico-AI-MCP-Enhanced/2.0',
            'Accept: application/json',
            'X-Source: medico-ai-php-server'
        ],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_ENCODING => 'gzip, deflate'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    $responseTime = round((microtime(true) - $startTime) * 1000, 2);
    curl_close($ch);
    
    if ($curlError) {
        throw new Exception("Network error: " . $curlError);
    }
    
    if ($httpCode !== 200) {
        throw new Exception("API error: HTTP {$httpCode} - " . ($response ?: 'No response'));
    }
    
    if (!$response) {
        throw new Exception("Empty response from AI service");
    }
    
    // Parse and validate response
    $responseData = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON response from AI service: " . json_last_error_msg());
    }
    
    $content = $responseData['choices'][0]['message']['content'] ?? 
               $responseData['content'] ?? 
               $responseData['response'] ?? 
               "No response content available";
    
    // Build successful response
    $result = [
        'success' => true,
        'content' => $content,
        'model' => $model,
        'timestamp' => date('c'),
        'response_time_ms' => $responseTime,
        'usage' => [
            'prompt_tokens' => strlen($prompt),
            'completion_tokens' => strlen($content),
            'total_tokens' => strlen($prompt) + strlen($content)
        ],
        'metadata' => [
            'language' => $language,
            'temperature' => $temperature,
            'max_tokens' => $max_tokens,
            'has_images' => !empty($images),
            'memory_items' => count($memory),
            'request_method' => $method,
            'endpoint' => $endpoint
        ]
    ];
    
    // Add debug info if requested
    if (isset($_GET['debug']) && $_GET['debug'] === '1') {
        $result['debug'] = [
            'request_uri' => $_SERVER['REQUEST_URI'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
            'payload_sent' => $payload,
            'raw_response' => $responseData
        ];
    }
    
    sendResponse($result);
    
} catch (Exception $e) {
    // Enhanced error handling
    $errorCode = 400;
    $errorMessage = $e->getMessage();
    
    // Categorize errors for better status codes
    if (strpos($errorMessage, 'Network error') !== false) {
        $errorCode = 502; // Bad Gateway
    } elseif (strpos($errorMessage, 'API error') !== false) {
        $errorCode = 503; // Service Unavailable
    } elseif (strpos($errorMessage, 'required') !== false) {
        $errorCode = 422; // Unprocessable Entity
    } elseif (strpos($errorMessage, 'Unsupported') !== false || strpos($errorMessage, 'Invalid') !== false) {
        $errorCode = 400; // Bad Request
    }
    
    $errorDetails = [
        'method' => $method,
        'endpoint' => $endpoint ?? 'unknown',
        'timestamp' => date('c'),
        'request_id' => uniqid('err_', true)
    ];
    
    // Add debug info if requested
    if (isset($_GET['debug']) && $_GET['debug'] === '1') {
        $errorDetails['debug'] = [
            'request_data' => $requestData ?? [],
            'server_info' => [
                'php_version' => PHP_VERSION,
                'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
            ],
            'memory_usage' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true)
        ];
    }
    
    sendError($errorMessage, $errorCode, $errorDetails);
}

/**
 * API Documentation and Usage Examples:
 * 
 * 1. GET with URL parameters:
 *    /mcp.php?prompt=What is hypertension?&model=openai&lang=en
 * 
 * 2. GET with route-based prompt:
 *    /mcp.php/ask/What is diabetes type 2?
 * 
 * 3. GET with model specification:
 *    /mcp.php/model/gemini/Explain cardiac cycle
 * 
 * 4. Health check endpoint:
 *    /mcp.php/health
 * 
 * 5. POST with JSON payload:
 *    POST /mcp.php
 *    Content-Type: application/json
 *    {
 *      "prompt": "Explain pharmacokinetics",
 *      "model": "deepseek",
 *      "system_prompt": "Medical education assistant",
 *      "language": "en",
 *      "temperature": 0.3,
 *      "max_tokens": 1000,
 *      "memory": [
 *        {"role": "user", "content": "Previous question"},
 *        {"role": "assistant", "content": "Previous answer"}
 *      ],
 *      "images": ["https://example.com/medical-image.jpg"]
 *    }
 * 
 * 6. Debug mode (add ?debug=1 to any request):
 *    /mcp.php?prompt=test&debug=1
 * 
 * Supported Models:
 * - openai (GPT-4)
 * - gemini (Google Gemini Pro)
 * - mistral (Mistral Large)
 * - deepseek (DeepSeek Chat)
 * - llama (Meta Llama)
 * 
 * Error Codes:
 * - 400: Bad Request (invalid parameters)
 * - 405: Method Not Allowed
 * - 422: Unprocessable Entity (missing required fields)
 * - 502: Bad Gateway (network error)
 * - 503: Service Unavailable (AI service error)
 */
?>