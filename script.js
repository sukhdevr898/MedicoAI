document.addEventListener('DOMContentLoaded', () => {
    // --- I. Document Structure & Initial Setup ---
    const splashScreen = document.getElementById('splash');
    const app = document.getElementById('app');
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImage');
    const fileNameSpan = imagePreview ? imagePreview.querySelector('.fileName') : null;
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettings');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const sizeButtons = document.querySelectorAll('.size-btn');
    const typingIndicatorToggle = document.getElementById('typingIndicator');
    const markdownRenderingToggle = document.getElementById('markdownRendering');
    const modelsBtn = document.getElementById('modelsBtn');
    const modelsModal = document.getElementById('modelsModal');
    const closeModelsBtn = document.getElementById('closeModels');
    const selectModelBtn = document.getElementById('selectModel'); // Now used
    const modelItems = document.querySelectorAll('.model-item'); // For model selection in the modal

    let uploadedImageFile = null;
    let currentAIModel = localStorage.getItem('selectedAIModel') || 'openai-large'; // Load saved model or default
    let selectedModelIdInModal = currentAIModel; // To track selection within the modal before saving
    let currentTypingIndicatorElement = null;

    const BOT_ICON_CLASS = "fas fa-robot text-green-600"; // Using robot for bot
    const USER_ICON_CLASS = "fas fa-user text-blue-600";

    // --- Splash Screen & App Visibility ---
    if (splashScreen && app) {
        setTimeout(() => {
            splashScreen.classList.add('opacity-0');
            splashScreen.addEventListener('transitionend', () => {
                splashScreen.classList.add('hidden');
                app.classList.remove('hidden');
                app.classList.add('flex');
            }, { once: true });
        }, 2000);
    } else {
        if (app) app.classList.remove('hidden');
    }

    // --- Core Chat Logic ---
    if (userInput) {
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadedImageFile = e.target.files[0];
                if (fileNameSpan) fileNameSpan.textContent = uploadedImageFile.name;
                if (imagePreview) imagePreview.classList.remove('hidden');
            }
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
            uploadedImageFile = null;
            if (imagePreview) imagePreview.classList.add('hidden');
        });
    }
    
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function displayMessage(content, sender, userImageSrc = null) {
        if (!chatContainer) return;

        const messageOuterDiv = document.createElement('div');
        // Alignment based on new HTML structure from ui.html
        messageOuterDiv.className = `max-w-3xl mx-auto fade-in ${sender === 'user' ? 'pl-10' : 'pr-10'}`;

        let imageHTML = '';
        if (userImageSrc && sender === 'user') {
            imageHTML = `
                <div class="mb-2 rounded-lg overflow-hidden max-w-xs ${sender === 'user' ? 'ml-auto' : ''}">
                    <img src="${userImageSrc}" alt="User uploaded image" class="max-w-full h-auto">
                </div>`;
        }
        
        // Sanitize content before inserting with innerHTML if it's from user/API
        // For now, simple text replacement for newlines. For full Markdown, a library is needed.
        const sanitizedContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');


        if (sender === 'user') {
            messageOuterDiv.innerHTML = `
                <div class="flex justify-end mb-2">
                    <div class="flex flex-col items-end">
                        ${imageHTML}
                        <div class="bg-blue-600 text-white rounded-xl rounded-tr-none px-4 py-3 shadow-sm">
                            <p>${sanitizedContent}</p>
                        </div>
                    </div>
                    <div class="ml-2 flex-shrink-0">
                        <div class="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <i class="${USER_ICON_CLASS}"></i>
                        </div>
                    </div>
                </div>
            `;
        } else { // Bot message
            const contentDivId = `bot-content-${Date.now()}`;
            let botContentHTML = sanitizedContent;
            // If markdown is enabled and we had a library:
            // if (markdownRenderingToggle && markdownRenderingToggle.checked) {
            // botContentHTML = marked.parse(content); // Example with 'marked' library
            // }

            const currentTheme = localStorage.getItem('theme') || 'light';
            let bubbleClasses = "bg-white border border-gray-200"; // Light theme default
            let titleColor = "text-green-700";
            let copyBtnClasses = "text-gray-400 hover:text-blue-600";
            let botIconBg = "bg-green-100";
            let botIconText = BOT_ICON_CLASS; // Default green defined earlier

            if (currentTheme === 'dark') {
                bubbleClasses = "bg-gray-700 border border-gray-600 text-gray-100"; // Dark theme
                titleColor = "text-green-400";
                copyBtnClasses = "text-gray-400 hover:text-blue-400";
                botIconBg = "bg-gray-600"; // Darker green background for bot icon
                // botIconText = "fas fa-robot text-green-400"; // Lighter green icon for dark theme
            } else if (currentTheme === 'blue') {
                bubbleClasses = "bg-blue-100 border border-blue-200 text-blue-900"; // Blue theme
                titleColor = "text-blue-700";
                copyBtnClasses = "text-blue-500 hover:text-blue-700";
                botIconBg = "bg-blue-200";
                // botIconText = "fas fa-robot text-blue-700";
            }
            // Note: Markdown content styles in index.html might need .dark .markdown-content ... or .blue-theme .markdown-content overrides
            
            messageOuterDiv.innerHTML = `
                <div class="flex mb-2">
                    <div class="mr-2 flex-shrink-0">
                        <div class="${botIconBg} h-10 w-10 rounded-full flex items-center justify-center">
                            <i class="${botIconText}"></i>
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="${bubbleClasses} rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-semibold ${titleColor}">medicoAI</span>
                                <button class="copy-btn ${copyBtnClasses}" aria-label="Copy message content">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div id="${contentDivId}" class="${markdownRenderingToggle && markdownRenderingToggle.checked ? 'markdown-content' : ''}">
                                ${botContentHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const copyButton = messageOuterDiv.querySelector('.copy-btn');
            if (copyButton) {
                copyButton.addEventListener('click', () => {
                    // Use original non-sanitized content for copying if possible, or re-parse for text
                    const textToCopy = content; // Use original content for copy
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        const icon = copyButton.querySelector('i');
                        icon.className = 'fas fa-check text-green-500';
                        copyButton.setAttribute('aria-label', 'Content copied to clipboard');
                        setTimeout(() => {
                            icon.className = 'fas fa-copy';
                            copyButton.setAttribute('aria-label', 'Copy message content');
                        }, 2000);
                    }).catch(err => console.error('Failed to copy text: ', err));
                });
            }
        }

        chatContainer.appendChild(messageOuterDiv);
        messageOuterDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    function showTypingIndicatorUI() {
        if (!chatContainer || (typingIndicatorToggle && !typingIndicatorToggle.checked)) return;
        if (currentTypingIndicatorElement) currentTypingIndicatorElement.remove(); 

        const currentTheme = localStorage.getItem('theme') || 'light';
        let bubbleClasses = "bg-white border border-gray-200"; // Light theme default
        let botIconBg = "bg-green-100";
        let botIconText = BOT_ICON_CLASS;

        if (currentTheme === 'dark') {
            bubbleClasses = "bg-gray-700 border border-gray-600";
            botIconBg = "bg-gray-600";
        } else if (currentTheme === 'blue') {
            bubbleClasses = "bg-blue-100 border border-blue-200";
            botIconBg = "bg-blue-200";
        }

        currentTypingIndicatorElement = document.createElement('div');
        currentTypingIndicatorElement.className = 'max-w-3xl mx-auto fade-in pr-10';
        currentTypingIndicatorElement.innerHTML = `
            <div class="flex mb-2">
                <div class="mr-2 flex-shrink-0">
                    <div class="${botIconBg} h-10 w-10 rounded-full flex items-center justify-center">
                        <i class="${botIconText}"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="${bubbleClasses} rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
                        <div class="flex">
                            <div class="typing"></div> <div class="typing"></div> <div class="typing"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        chatContainer.appendChild(currentTypingIndicatorElement);
        currentTypingIndicatorElement.scrollIntoView({ behavior: 'smooth' });
    }

    function hideTypingIndicatorUI() {
        if (currentTypingIndicatorElement) {
            currentTypingIndicatorElement.remove();
            currentTypingIndicatorElement = null;
        }
    }

    async function getPollinationAIResponse(userText, base64ImageDataUrl) {
        showTypingIndicatorUI();
        const apiUrl = 'https://text.pollinations.ai/openai';
        // Use the currentAIModel variable, which is loaded from localStorage or defaults
        const modelName = currentAIModel;

        const messages = [
            { "role": "system", "content": "You are medicoAI, a helpful assistant for medical students preparing for exams. Provide accurate answers and explanations in medicine. Format responses using Markdown where appropriate for tables, lists, code blocks, bolding, italics etc." }
        ];

        if (base64ImageDataUrl) {
            messages.push({
                "role": "user", "content": [{ "type": "text", "text": userText }, { "type": "image_url", "image_url": { "url": base64ImageDataUrl } }]
            });
        } else {
            messages.push({ "role": "user", "content": userText });
        }

        const payload = { "model": modelName, "messages": messages, "max_tokens": 2000, "referrer": "medicoAI_ExternalJS_v2" };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            hideTypingIndicatorUI();
            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                    displayMessage(data.choices[0].message.content, 'bot');
                } else {
                    displayMessage("Sorry, the AI response was not in the expected format.", 'bot');
                }
            } else {
                displayMessage(`Sorry, I encountered an error (Status: ${response.status}). Please try again.`, 'bot');
            }
        } catch (error) {
            hideTypingIndicatorUI();
            displayMessage("Sorry, I couldn't connect to the AI. Please check your internet connection.", 'bot');
        }
    }
    
    async function handleSendMessage() {
        const text = userInput.value.trim();
        const currentImageFile = uploadedImageFile;
        if (text === '' && !currentImageFile) return;

        let base64ImageDataUrl = null;
        if (currentImageFile) {
            try {
                base64ImageDataUrl = await fileToBase64(currentImageFile);
            } catch (error) {
                displayMessage("Error preparing image. Please try again.", 'user'); return;
            }
        }
        
        displayMessage(text || (currentImageFile ? currentImageFile.name : "Image uploaded"), 'user', base64ImageDataUrl);
        getPollinationAIResponse(text, base64ImageDataUrl);

        userInput.value = '';
        userInput.style.height = 'auto';
        if (fileInput) fileInput.value = '';
        uploadedImageFile = null;
        if (imagePreview) imagePreview.classList.add('hidden');
    }

    if (sendBtn) sendBtn.addEventListener('click', handleSendMessage);
    if (userInput) {
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
        });
    }

    // --- Settings & Models Modals ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    }
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    }
    // Close modal if clicked outside of the modal content (on the backdrop)
    if (settingsModal) {
        settingsModal.addEventListener('click', (event) => {
            if (event.target === settingsModal) { // Check if the click is on the backdrop itself
                settingsModal.classList.add('hidden');
            }
        });
    }

    if (modelsBtn) {
        modelsBtn.addEventListener('click', () => {
            modelsModal.classList.remove('hidden');
            selectedModelIdInModal = currentAIModel; // Reset modal selection to current actual model
            updateModelSelectionVisual(); // Update visual based on current actual model
        });
    }
    if (closeModelsBtn) {
        closeModelsBtn.addEventListener('click', () => modelsModal.classList.add('hidden'));
    }
    if (modelsModal) { // Also close on backdrop click
        modelsModal.addEventListener('click', (event) => {
            if (event.target === modelsModal) {
                modelsModal.classList.add('hidden');
            }
        });
    }

    // Model Selection Logic
    function updateModelSelectionVisual() {
        modelItems.forEach(item => {
            if (item.dataset.model === selectedModelIdInModal) {
                // Highlight selected: e.g., border and shadow
                item.classList.add('ring-2', 'ring-blue-500', 'border-transparent', 'shadow-lg');
                item.classList.remove('border-gray-200');
            } else {
                // Default state for non-selected
                item.classList.remove('ring-2', 'ring-blue-500', 'border-transparent', 'shadow-lg');
                item.classList.add('border-gray-200');
            }
        });
    }

    modelItems.forEach(item => {
        item.addEventListener('click', function() {
            selectedModelIdInModal = this.dataset.model; // Temporarily store selection
            updateModelSelectionVisual();
        });
    });

    if (selectModelBtn) {
        selectModelBtn.addEventListener('click', () => {
            if (selectedModelIdInModal) {
                currentAIModel = selectedModelIdInModal; // Commit selection
                localStorage.setItem('selectedAIModel', currentAIModel);
                console.log(`AI Model selected and saved: ${currentAIModel}`);
            }
            modelsModal.classList.add('hidden');
        });
    }
    
    // Initial visual update for model items when the script loads or modal is opened
    // This ensures the currently active model (from localStorage or default) is highlighted.
    // Call it once at load time to set the initial state of selectedModelIdInModal for the first modal open.
    selectedModelIdInModal = currentAIModel; 
    // updateModelSelectionVisual(); // No need to call here, called when modal opens


    // Theme Switching
    function applyTheme(theme) {
        document.documentElement.classList.remove('dark', 'blue-theme'); // Remove potential existing theme classes from html
        document.body.className = "font-['Poppins'] h-screen flex flex-col"; // Reset body classes

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('bg-gray-900', 'text-gray-100');
        } else if (theme === 'blue') {
            document.documentElement.classList.add('blue-theme'); // Custom class for more specific blue theme styles if needed
            document.body.classList.add('bg-blue-50', 'text-blue-900'); // Example blue theme
        } else { // Light theme
            document.body.classList.add('bg-gray-50', 'text-gray-800');
        }
        localStorage.setItem('theme', theme);
        themeButtons.forEach(b => {
            b.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500');
            if (b.dataset.theme === theme) {
                b.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
            }
        });
    }
    themeButtons.forEach(btn => btn.addEventListener('click', function() { applyTheme(this.dataset.theme); }));
    applyTheme(localStorage.getItem('theme') || 'light');


    // Font Size Switching
    function applyFontSize(size) {
        const sizes = { sm: '14px', md: '16px', lg: '18px' };
        document.body.style.fontSize = sizes[size] || sizes['md'];
        localStorage.setItem('fontSize', size);
        sizeButtons.forEach(b => {
            b.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500');
            if (b.dataset.size === size) {
                b.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
            }
        });
    }
    sizeButtons.forEach(btn => btn.addEventListener('click', function() { applyFontSize(this.dataset.size); }));
    applyFontSize(localStorage.getItem('fontSize') || 'md');

    // Chat Options Toggles
    [typingIndicatorToggle, markdownRenderingToggle].forEach(toggle => {
        if (toggle) {
            const storageKey = toggle.id === 'typingIndicator' ? 'typingIndicatorEnabled' : 'markdownEnabled';
            toggle.checked = JSON.parse(localStorage.getItem(storageKey) ?? 'true');
            toggle.addEventListener('change', () => localStorage.setItem(storageKey, toggle.checked));
        }
    });
});
