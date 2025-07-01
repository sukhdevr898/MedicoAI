const MCP_SERVER_URL = 'https://your-server.com/mcp-server.php'; // Replace with your actual server URL
const FALLBACK_API_URL = 'https://text.Pollinations.ai';

class ApiService {
  constructor() {
    this.requestTimeout = 30000; // 30 seconds
  }

  /**
   * Generate system prompt with user settings
   */
  generateSystemPrompt(userName, selectedModel) {
    return `Medico AI is a cutting-edge medical assistant designed to support medical students in studying, clinical reasoning, exam preparation, and medical research. It delivers detailed, evidence-based, and current medical knowledge, always citing authoritative sources and providing clear, comprehensive explanations.

User Information:
- Name: ${userName}
- Preferred AI Model: ${selectedModel}

Medico AI excels in analyzing images, illustrating concepts visually, and simulating clinical scenarios to enhance learning. It offers assistance with multiple-choice questions (MCQs), Objective Structured Clinical Examinations (OSCEs), case discussions, and more. The AI ensures clarity by acknowledging uncertainties and strictly refrains from providing real patient care advice.

When responding, if you mention mathematical, physics, or scientific symbols and formulas, use LaTeX markdown format. Always wrap LaTeX expressions in single dollar signs ($ ... $) for inline math, or double dollar signs ($$ ... $$) for block math.

Created and maintained by Sukhdev Singh, a computer science professional passionate about integrating technology with medical education. Connect with Sukhdev on GitHub at https://github.com/sukhdevr898 and Instagram @sukh_rai898.

This tool was created for medical education and training. Respond in a helpful, educational manner appropriate for medical students and healthcare professionals in training. Address the user by name when appropriate and maintain a professional yet approachable tone.`;
  }

  /**
   * Send message to MCP server with conversation memory
   */
  async sendToMCP(prompt, options = {}) {
    const {
      images = [],
      userName = 'Student',
      selectedModel = 'mistral',
      chatHistory = [],
      language = 'en'
    } = options;

    // Prepare conversation memory (last 10 exchanges)
    const memory = chatHistory
      .slice(-20)
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role,
        content: msg.content || '',
        images: msg.images || []
      }));

    const payload = {
      prompt,
      images,
      system_prompt: this.generateSystemPrompt(userName, selectedModel),
      language,
      model: selectedModel,
      memory
    };

    try {
      const response = await fetch(MCP_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: this.requestTimeout,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          content: data.content || 'No response from MCP server.',
          source: 'mcp'
        };
      } else {
        throw new Error(`MCP Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.warn('MCP Server error:', error.message);
      // Fallback to Pollinations.ai
      return this.sendToFallbackAPI(prompt, options);
    }
  }

  /**
   * Fallback to Pollinations.ai API
   */
  async sendToFallbackAPI(prompt, options = {}) {
    const {
      images = [],
      selectedModel = 'mistral',
      language = 'en'
    } = options;

    try {
      if (images && images.length > 0) {
        // Handle vision requests
        return this.sendVisionRequest(prompt, images, selectedModel);
      } else {
        // Handle text-only requests
        return this.sendTextRequest(prompt, selectedModel, language);
      }
    } catch (error) {
      console.error('Fallback API error:', error);
      return {
        success: false,
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        source: 'error'
      };
    }
  }

  /**
   * Send vision request to Pollinations.ai
   */
  async sendVisionRequest(prompt, images, model) {
    const contentArray = [{ type: 'text', text: prompt }];
    
    images.forEach(img => {
      contentArray.push({
        type: 'image_url',
        image_url: { 
          url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}` 
        }
      });
    });

    const payload = {
      model,
      messages: [
        { role: 'system', content: this.generateSystemPrompt('Student', model) },
        { role: 'user', content: contentArray }
      ],
      max_tokens: 700,
      temperature: 0.2
    };

    const response = await fetch(`${FALLBACK_API_URL}/openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        content: data.choices?.[0]?.message?.content || 'No response from vision API.',
        source: 'fallback-vision'
      };
    } else {
      throw new Error(`Vision API error: ${response.status}`);
    }
  }

  /**
   * Send text request to Pollinations.ai
   */
  async sendTextRequest(prompt, model, language) {
    let url = `${FALLBACK_API_URL}/${encodeURIComponent(prompt)}`;
    const params = new URLSearchParams();
    
    params.set('model', model);
    if (language && language !== 'en') {
      params.set('system', `Respond in ${this.getLanguageName(language)}`);
    }
    
    url += `?${params.toString()}`;

    const response = await fetch(url);
    
    if (response.ok) {
      const content = await response.text();
      return {
        success: true,
        content,
        source: 'fallback-text'
      };
    } else {
      throw new Error(`Text API error: ${response.status}`);
    }
  }

  /**
   * Get language name from code
   */
  getLanguageName(code) {
    const languages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese'
    };
    return languages[code] || 'English';
  }

  /**
   * Generate image using Pollinations.ai
   */
  async generateImage(prompt, options = {}) {
    const {
      model = 'flux',
      width = 512,
      height = 512
    } = options;

    let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    const params = new URLSearchParams();
    
    if (model) params.set('model', model);
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('nologo', 'true');
    
    url += `?${params.toString()}`;
    
    return {
      success: true,
      imageUrl: url,
      source: 'pollinations-image'
    };
  }

  /**
   * Test MCP server connectivity
   */
  async testMCPConnection() {
    try {
      const response = await fetch(MCP_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'test',
          system_prompt: 'You are a medical AI assistant.',
          model: 'mistral'
        }),
        timeout: 5000,
      });

      return {
        connected: response.ok,
        status: response.status,
        message: response.ok ? 'MCP Server is accessible' : 'MCP Server returned an error'
      };
    } catch (error) {
      return {
        connected: false,
        status: 0,
        message: `Connection failed: ${error.message}`
      };
    }
  }
}

export default new ApiService();