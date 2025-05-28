document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('chat-area');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const imageUpload = document.getElementById('image-upload');
    const splashScreen = document.getElementById('splash-screen');
    const app = document.getElementById('app');

    // Settings Modal Elements
    const settingsButton = document.getElementById('settings-button'); // Updated from settingsIcon
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalButton = document.getElementById('close-settings-modal');
    const themeToggle = document.getElementById('theme-toggle');
    const fontSmallerButton = document.getElementById('font-smaller');
    const fontResetButton = document.getElementById('font-reset');
    const fontLargerButton = document.getElementById('font-larger');
    const fontSizeIndicator = document.getElementById('font-size-indicator');


    let uploadedImageFile = null; // Stores the File object for the uploaded image

    // Splash screen timeout & fade-out logic
    if (splashScreen && app) { // Ensure elements exist
        setTimeout(() => {
            splashScreen.classList.add('splash-fade-out'); // Start fade-out (CSS transition)

            splashScreen.addEventListener('transitionend', () => {
                splashScreen.classList.add('hidden'); // Actually hide after transition
                app.classList.remove('hidden');
                app.classList.add('flex'); // Ensure app is displayed as a flex container
            }, { once: true }); // Ensure event listener is removed after firing once

        }, 2500); // Adjusted delay to 2.5 seconds
    } else {
        // Fallback if splash screen or app element is not found (should not happen in normal flow)
        if (app) app.classList.remove('hidden');
    }

    // Settings Modal Visibility Logic
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.remove('hidden');
                settingsModal.classList.add('flex'); // Use flex to show as per HTML structure
            }
        });
    }
    if (closeSettingsModalButton) {
        closeSettingsModalButton.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.add('hidden');
                settingsModal.classList.remove('flex');
            }
        });
    }
    if (settingsModal) {
        // Close modal if clicked outside of the modal content (on the backdrop)
        settingsModal.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                settingsModal.classList.add('hidden');
                settingsModal.classList.remove('flex');
            }
        });
    }

    // Theme Switching Logic
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.documentElement.classList.remove('dark');
            if (themeToggle) themeToggle.checked = false;
        }
    };

    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // Load Saved Theme on Startup
    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme || 'light'); // Default to light if no theme saved


    // Font Size Adjustment Logic
    const fontSizes = [
        { name: 'Smallest', value: '0.8rem', scale: 0.8 }, // Example: smaller
        { name: 'Small', value: '0.9rem', scale: 0.9 },
        { name: 'Normal', value: '1rem', scale: 1.0 },    // Base size
        { name: 'Large', value: '1.1rem', scale: 1.1 },
        { name: 'Largest', value: '1.2rem', scale: 1.2 } // Example: larger
    ];
    let currentFontSizeIndex = fontSizes.findIndex(fs => fs.name === 'Normal'); // Default to normal

    const updateFontSizeIndicator = () => {
        if (fontSizeIndicator) {
            fontSizeIndicator.textContent = `Current: ${fontSizes[currentFontSizeIndex].name}`;
        }
    };
    
    const applyFontSize = (index) => {
        if (index >= 0 && index < fontSizes.length) {
            currentFontSizeIndex = index;
            document.body.style.fontSize = fontSizes[currentFontSizeIndex].value;
            localStorage.setItem('fontSize', fontSizes[currentFontSizeIndex].name);
            updateFontSizeIndicator();
        }
    };

    if (fontSmallerButton) {
        fontSmallerButton.addEventListener('click', () => {
            if (currentFontSizeIndex > 0) {
                applyFontSize(currentFontSizeIndex - 1);
            }
        });
    }

    if (fontLargerButton) {
        fontLargerButton.addEventListener('click', () => {
            if (currentFontSizeIndex < fontSizes.length - 1) {
                applyFontSize(currentFontSizeIndex + 1);
            }
        });
    }

    if (fontResetButton) {
        fontResetButton.addEventListener('click', () => {
            const defaultIndex = fontSizes.findIndex(fs => fs.name === 'Normal');
            applyFontSize(defaultIndex);
        });
    }

    // Load Saved Font Size on Startup
    const savedFontSizeName = localStorage.getItem('fontSize');
    const initialFontSizeIndex = fontSizes.findIndex(fs => fs.name === savedFontSizeName);
    if (initialFontSizeIndex !== -1) {
        applyFontSize(initialFontSizeIndex);
    } else {
        applyFontSize(fontSizes.findIndex(fs => fs.name === 'Normal')); // Default to normal
    }


    /**
     * Converts a File object to a base64 data URL string.
     * @param {File} file - The file to convert.
     * @returns {Promise<string>} A promise that resolves with the data URL.
     */
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Displays a message in the chat area.
     * @param {string | HTMLElement} content - The message content (text or HTML element).
     * @param {string} sender - 'user' or 'bot'.
     */
    function displayMessage(content, sender) {
        if (!chatArea) return;

        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        // Tailwind typography classes for dark mode are applied in style.css or directly on elements
        // e.g., messageWrapper.classList.add('dark:text-gray-200'); 

        if (typeof content === 'string') {
            messageWrapper.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            messageWrapper.appendChild(content);
        }

        if (sender === 'bot') {
            const copyButton = document.createElement('button');
            copyButton.classList.add('copy-btn', 'ml-2', 'p-1', 'text-xs', 'bg-gray-200', 'hover:bg-gray-300', 'rounded', 'align-top', 'dark:bg-gray-600', 'dark:hover:bg-gray-500', 'dark:text-gray-200');
            copyButton.innerHTML = '<i class="fas fa-copy mr-1"></i>Copy'; // Added mr-1 for spacing
            copyButton.setAttribute('aria-label', 'Copy message content');
            messageWrapper.appendChild(copyButton);
        }

        // Optional: Add user/bot icons to messages
        // This is a stylistic choice and can be expanded.
        // const iconElement = document.createElement('i');
        // if (sender === 'user') {
        //     iconElement.classList.add('fas', 'fa-user', 'mr-2', 'text-sm', 'align-middle');
        // } else {
        //     iconElement.classList.add('fas', 'fa-robot', 'mr-2', 'text-sm', 'align-middle');
        // }
        // messageWrapper.insertBefore(iconElement, messageWrapper.firstChild);


        chatArea.appendChild(messageWrapper);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    let typingIndicatorElement;
    /**
     * Shows a typing indicator for the bot.
     */
    function showTypingIndicator() {
        if (!chatArea) return;
        if (typingIndicatorElement) return;

        typingIndicatorElement = document.createElement('div');
        typingIndicatorElement.classList.add('message', 'bot-message', 'typing-indicator', 'dark:text-gray-300'); // Dark mode for typing indicator
        typingIndicatorElement.textContent = "MedicoAI is typing...";
        chatArea.appendChild(typingIndicatorElement);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    /**
     * Hides the typing indicator for the bot.
     */
    function hideTypingIndicator() {
        if (typingIndicatorElement) {
            typingIndicatorElement.remove();
            typingIndicatorElement = null;
        }
    }

    /**
     * Fetches a response from the Pollination AI API.
     * @param {string} userText - The text input from the user.
     * @param {string | null} imageDataUrl - Base64 data URL of the image, or null.
     */
    async function getPollinationAIResponse(userText, imageDataUrl) {
        showTypingIndicator();
        const apiUrl = 'https://text.pollinations.ai/openai';
        const modelName = "openai-large";

        const messages = [
            { "role": "system", "content": "You are medicoAI, a helpful assistant for medical students preparing for exams. Provide accurate answers and explanations in medicine." }
        ];

        if (imageDataUrl) {
            messages.push({
                "role": "user",
                "content": [
                    { "type": "text", "text": userText },
                    { "type": "image_url", "image_url": { "url": imageDataUrl } }
                ]
            });
        } else {
            messages.push({ "role": "user", "content": userText });
        }

        const payload = {
            "model": modelName,
            "messages": messages,
            "max_tokens": 1000,
            "referrer": "medicoAI"
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            hideTypingIndicator();

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                    const botMessage = data.choices[0].message.content;
                    displayMessage(botMessage, 'bot');
                } else {
                    console.error('API response format error:', data);
                    displayMessage("Sorry, the AI response was not in the expected format. Please try again.", 'bot');
                }
            } else {
                const errorData = await response.text();
                console.error('API error:', response.status, errorData);
                displayMessage(`Sorry, I encountered an error (Status: ${response.status}). Please try again.`, 'bot');
            }
        } catch (error) {
            hideTypingIndicator();
            console.error('Fetch API call failed:', error);
            displayMessage("Sorry, I couldn't connect to the AI. Please check your internet connection and try again.", 'bot');
        }
    }

    /**
     * Handles sending a message (text and/or image).
     */
    async function sendMessage() {
        const text = userInput.value.trim();
        const currentImageFile = uploadedImageFile;

        if (text === '' && !currentImageFile) {
            return;
        }

        if (currentImageFile) {
            try {
                const dataUrl = await fileToBase64(currentImageFile);
                const img = document.createElement('img');
                img.src = dataUrl;
                img.style.maxWidth = '200px';
                img.style.maxHeight = '200px';
                img.style.borderRadius = '0.5rem';
                img.classList.add('mt-2');

                if (text) {
                    const contentDiv = document.createElement('div');
                    const textDiv = document.createElement('div');
                    textDiv.textContent = text;
                    contentDiv.appendChild(textDiv);
                    contentDiv.appendChild(img);
                    displayMessage(contentDiv, 'user');
                } else {
                    displayMessage(img, 'user');
                }
                getPollinationAIResponse(text, dataUrl);

            } catch (error) {
                console.error("Error converting file to Base64 for display:", error);
                displayMessage("Error preparing image for display.", 'user');
                if (text) getPollinationAIResponse(text, null);
            }
        } else if (text) {
            displayMessage(text, 'user');
            getPollinationAIResponse(text, null);
        }

        userInput.value = '';
        imageUpload.value = '';
        uploadedImageFile = null;
        userInput.placeholder = "Type your message...";
    }

    // Event Listeners for Sending Message
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    if (userInput) {
        userInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Event Listener for Copy Button (using event delegation)
    if (chatArea) {
        chatArea.addEventListener('click', (event) => {
            const target = event.target.closest('.copy-btn');
            if (target) {
                const messageBubble = target.closest('.bot-message');
                if (messageBubble) {
                    const messageClone = messageBubble.cloneNode(true);
                    const buttonInClone = messageClone.querySelector('.copy-btn');
                    if (buttonInClone) buttonInClone.remove();
                    
                    const textToCopy = messageClone.textContent || messageClone.innerText;
                    navigator.clipboard.writeText(textToCopy.trim())
                        .then(() => {
                            const originalButtonHTML = target.innerHTML; // Store original HTML
                            const originalAriaLabel = target.getAttribute('aria-label');
                            target.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
                            target.setAttribute('aria-label', 'Content copied to clipboard');
                            target.disabled = true;
                            setTimeout(() => {
                                target.innerHTML = originalButtonHTML; // Restore original HTML
                                target.setAttribute('aria-label', originalAriaLabel || 'Copy message content');
                                target.disabled = false;
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy text: ', err);
                            alert('Failed to copy. Please try manually.');
                        });
                }
            }
        });
    }

    // Event Listener for Image Upload
    if (imageUpload) {
        imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                uploadedImageFile = file;
                if (userInput) {
                    userInput.placeholder = `Image "${file.name}" selected. Add a message?`;
                }
            }
        });
    }
});
