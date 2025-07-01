# 🏥 Medico AI - Enhanced MCP Server Documentation

## Overview

The Medico AI MCP (Model Context Protocol) server has been completely enhanced to support URL endpoint requests and responses. This advanced PHP server provides a robust REST API for medical AI interactions with multiple request methods, route-based endpoints, and comprehensive error handling.

## 🚀 Features

### ✅ **Enhanced Request Handling**
- **GET Requests**: URL parameters, route-based prompts, model-specific routes
- **POST Requests**: JSON payload support with full conversation memory
- **OPTIONS**: Proper CORS preflight handling
- **Health Check**: System status and capability endpoints

### ✅ **Multiple Endpoint Patterns**
1. **URL Parameter Pattern**: `?prompt=question&model=openai`
2. **Route-based Pattern**: `/ask/your-question`
3. **Model Route Pattern**: `/model/gemini/your-question`
4. **Health Endpoint**: `/health`

### ✅ **Medical AI Specialization**
- Default medical education system prompts
- Multi-language support (EN, ES, FR, DE, etc.)
- Medical model validation and optimization
- Healthcare-focused error messages

### ✅ **Advanced Features**
- Input validation and sanitization
- Request logging and monitoring
- Debug mode with detailed information
- Response time tracking
- Memory usage monitoring
- Comprehensive error categorization

---

## 📋 API Endpoints

### 1. Health Check Endpoint
**GET** `/mcp.php/health`

Returns server status and capabilities.

```json
{
  "success": true,
  "status": "healthy",
  "service": "Medico AI MCP Server",
  "version": "2.0",
  "supported_models": ["openai", "gemini", "mistral", "deepseek", "llama"],
  "endpoints": [...]
}
```

### 2. URL Parameter Requests
**GET** `/mcp.php?prompt=<question>&model=<model>&lang=<language>`

**Parameters:**
- `prompt` or `q`: Your medical question (required)
- `model`: AI model to use (optional, default: openai)
- `language` or `lang`: Response language (optional, default: en)
- `system_prompt` or `system`: Custom system prompt (optional)
- `temperature`: Response creativity (0.0-2.0, default: 0.2)
- `max_tokens`: Maximum response length (1-2000, default: 700)
- `images`: Comma-separated image URLs for analysis
- `memory`: JSON-encoded conversation history
- `debug`: Set to "1" for debug information

**Example:**
```
GET /mcp.php?prompt=What is hypertension?&model=gemini&lang=en&debug=1
```

### 3. Route-based Prompt Requests
**GET** `/mcp.php/ask/<question>`
**GET** `/mcp.php/query/<question>`
**GET** `/mcp.php/prompt/<question>`

**Example:**
```
GET /mcp.php/ask/What is diabetes type 2?
GET /mcp.php/query/Explain cardiac cycle
```

### 4. Model-specific Route Requests
**GET** `/mcp.php/model/<model>/<question>`

**Example:**
```
GET /mcp.php/model/deepseek/Explain pharmacokinetics
GET /mcp.php/model/gemini/What are the symptoms of pneumonia?
```

### 5. JSON POST Requests
**POST** `/mcp.php`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "prompt": "Explain the pathophysiology of heart failure",
  "model": "deepseek",
  "system_prompt": "You are a cardiology specialist",
  "language": "en",
  "temperature": 0.3,
  "max_tokens": 1000,
  "memory": [
    {"role": "user", "content": "What is ejection fraction?"},
    {"role": "assistant", "content": "Ejection fraction is..."}
  ],
  "images": ["https://example.com/ecg-image.jpg"]
}
```

---

## 🎯 Supported AI Models

| Model | Description | Best For |
|-------|-------------|----------|
| `openai` | GPT-4 (Default) | General medical questions |
| `openai-large` | GPT-4 Large | Complex medical cases |
| `gemini` | Google Gemini Pro | Medical image analysis |
| `mistral` | Mistral Large | Clinical reasoning |
| `deepseek` | DeepSeek Chat | Medical research |
| `deepseek-reasoning` | DeepSeek Reasoning | Diagnostic reasoning |
| `qwen-coder` | Qwen Coder | Medical coding |
| `phi` | Microsoft Phi | Quick consultations |
| `llama` | Meta Llama | Educational content |
| `llamascout` | Llama Scout | Medical literature |

---

## 🌍 Language Support

| Code | Language | Medical Prompt |
|------|----------|----------------|
| `en` | English | Full medical education assistant |
| `es` | Spanish | Asistente médico educativo |
| `fr` | French | Assistant médical éducatif |
| `de` | German | Medizinischer Bildungsassistent |
| `it` | Italian | Assistente educativo medico |
| `pt` | Portuguese | Assistente médico educacional |
| `ru` | Russian | Медицинский образовательный помощник |
| `ja` | Japanese | 医学教育アシスタント |
| `ko` | Korean | 의학 교육 도우미 |
| `zh` | Chinese | 医学教育助手 |

---

## 📊 Response Format

### Successful Response
```json
{
  "success": true,
  "content": "Hypertension, also known as high blood pressure...",
  "model": "openai",
  "timestamp": "2024-01-15T10:30:00+00:00",
  "response_time_ms": 1247.3,
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 287,
    "total_tokens": 332
  },
  "metadata": {
    "language": "en",
    "temperature": 0.2,
    "max_tokens": 700,
    "has_images": false,
    "memory_items": 0,
    "request_method": "GET",
    "endpoint": "mcp.php"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Prompt is required",
  "error_code": 422,
  "timestamp": "2024-01-15T10:30:00+00:00",
  "request_id": "mcp_65a4d2e8f1a2b",
  "details": {
    "method": "GET",
    "endpoint": "mcp.php"
  }
}
```

---

## 🔧 Installation & Setup

### 1. Server Requirements
- PHP 7.4 or higher
- cURL extension enabled
- JSON extension enabled
- Web server (Apache/Nginx)

### 2. File Structure
```
/
├── mcp-server.php      # Main enhanced server
├── mcp.php            # Alternative enhanced server
├── test-endpoints.html # Testing interface
└── mcp_access.log     # Access logs (auto-created)
```

### 3. Web Server Configuration

#### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ mcp.php/$1 [QSA,L]

# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

#### Nginx
```nginx
location /mcp.php {
    try_files $uri $uri/ /mcp.php?$query_string;
    
    # Enable CORS
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    
    # Handle OPTIONS requests
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

### 4. Testing the Installation

1. **Open test interface**: `http://yourserver.com/test-endpoints.html`
2. **Health check**: `http://yourserver.com/mcp.php/health`
3. **Simple test**: `http://yourserver.com/mcp.php?prompt=test`

---

## 🧪 Usage Examples

### Example 1: Simple Medical Question
```bash
curl "http://yourserver.com/mcp.php?prompt=What is pneumonia?&model=openai"
```

### Example 2: Advanced POST Request
```bash
curl -X POST http://yourserver.com/mcp.php \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain the mechanism of action of ACE inhibitors",
    "model": "deepseek",
    "system_prompt": "You are a pharmacology expert",
    "temperature": 0.3,
    "max_tokens": 800
  }'
```

### Example 3: Route-based Request
```bash
curl "http://yourserver.com/mcp.php/ask/What are the side effects of metformin?"
```

### Example 4: Model-specific Request
```bash
curl "http://yourserver.com/mcp.php/model/gemini/Analyze this ECG pattern"
```

### Example 5: Debug Mode
```bash
curl "http://yourserver.com/mcp.php?prompt=test&debug=1"
```

---

## 🛡️ Security Features

### Input Validation
- HTML/XSS sanitization
- SQL injection prevention
- Model validation
- Parameter type checking
- Length restrictions

### Rate Limiting (Recommended)
```php
// Add to your server configuration
$requests_per_minute = 60;
$client_ip = $_SERVER['REMOTE_ADDR'];
// Implement rate limiting logic
```

### API Key Authentication (Optional)
```php
// Add to request validation
$api_key = $_SERVER['HTTP_X_API_KEY'] ?? '';
if (!validateApiKey($api_key)) {
    sendError('Invalid API key', 401);
}
```

---

## 📈 Monitoring & Logging

### Access Logs
Automatic logging to `mcp_access.log`:
```
2024-01-15 10:30:45 - GET mcp.php - Model: openai - Prompt: 45 chars
2024-01-15 10:31:12 - POST mcp.php - Model: gemini - Prompt: 123 chars
```

### Error Logging
PHP error logs with detailed information:
```
MCP Error [422]: Prompt is required
MCP Server Request - Model: openai, Prompt length: 45
```

### Performance Monitoring
- Response time tracking
- Memory usage monitoring
- Request method statistics
- Model usage analytics

---

## 🔄 Error Codes

| Code | Description | Meaning |
|------|-------------|---------|
| 200 | Success | Request processed successfully |
| 204 | No Content | OPTIONS preflight response |
| 400 | Bad Request | Invalid parameters or format |
| 401 | Unauthorized | Invalid API key (if implemented) |
| 405 | Method Not Allowed | Unsupported HTTP method |
| 422 | Unprocessable Entity | Missing required fields |
| 502 | Bad Gateway | Network/connectivity error |
| 503 | Service Unavailable | AI service error |

---

## 🚀 Advanced Configuration

### Custom System Prompts
```php
// Modify in mcp.php
$medicalPrompts = [
    'cardiology' => 'You are a cardiology specialist...',
    'pediatrics' => 'You are a pediatric medicine expert...',
    'surgery' => 'You are a surgical consultant...'
];
```

### Model Configuration
```php
// Add new models in validateModel function
$validModels = [
    'custom-model' => 'Custom Medical Model',
    'specialized-ai' => 'Specialized Medical AI'
];
```

### Extended Logging
```php
// Enhanced logging function
function logRequest($method, $endpoint, $model, $promptLength, $userId = null) {
    $logEntry = [
        'timestamp' => date('c'),
        'method' => $method,
        'endpoint' => $endpoint,
        'model' => $model,
        'prompt_length' => $promptLength,
        'user_id' => $userId,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    error_log(json_encode($logEntry) . "\n", 3, 'mcp_detailed.log');
}
```

---

## 🎮 Testing Interface

Use the included `test-endpoints.html` file for interactive testing:

1. **Health Check**: Verify server status
2. **GET Parameters**: Test URL parameter requests
3. **Route-based**: Test route-based endpoints
4. **Model Routes**: Test model-specific routes
5. **POST JSON**: Test JSON payload requests
6. **Debug Mode**: Test with debug information

---

## 🔮 Future Enhancements

### Planned Features
- [ ] WebSocket streaming support
- [ ] Conversation session management
- [ ] Medical image analysis endpoints
- [ ] Integration with medical databases
- [ ] FHIR (Fast Healthcare Interoperability Resources) support
- [ ] Medical terminology validation
- [ ] Clinical decision support tools

### Contribution
To contribute to the Medico AI MCP server:
1. Fork the repository
2. Create a feature branch
3. Implement enhancements
4. Add comprehensive tests
5. Submit a pull request

---

## 📞 Support

For technical support or questions:
- **Documentation**: This README file
- **Test Interface**: `test-endpoints.html`
- **Health Check**: `/mcp.php/health`
- **Debug Mode**: Add `?debug=1` to any request

---

## 📄 License

This Medico AI MCP Server is designed for educational and medical training purposes. Always consult qualified healthcare professionals for patient care decisions.

**Created by Sukhdev Singh** - Enhanced MCP Server for Medical AI Applications

---

*Last Updated: January 2024*