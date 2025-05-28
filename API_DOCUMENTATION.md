# medicoAI API Documentation

## 1. Introduction

medicoAI utilizes the Pollination AI service as its backend for generating responses to user queries. Communication with the Pollination AI service is primarily handled via their OpenAI-compatible POST endpoint, allowing for text and image-based interactions.

## 2. Authentication

The application uses referrer-based authentication. For frontend web applications like medicoAI, the browser automatically sends the `Referer` header with each request, which Pollination AI uses to identify the source of the request.

Additionally, medicoAI includes an optional `referrer: "medicoAI"` field in the JSON payload sent to the API. This serves as an explicit identifier for the application.

## 3. Primary AI Model Used

-   **Name:** OpenAI GPT-4.1 (Vision capable)
-   **Identifier used in API calls:** `openai-large`
-   **Key Capabilities:** This model excels in text understanding, complex text generation, and vision (image analysis). It is well-suited for medicoAI's purpose of providing detailed answers and explanations for medical students, including interpreting medical images.

## 4. API Endpoint

-   **URL:** `https://text.pollinations.ai/openai`
-   **Method:** `POST`

## 5. Request Format

### Headers

-   `Content-Type: application/json`

### Body (JSON)

The body of the POST request is a JSON object containing details about the model, messages, and other parameters.

**Key Fields Explained:**

-   `model`: (string) The identifier for the AI model to be used (e.g., `"openai-large"`).
-   `messages`: (array) An array of message objects that form the conversation history.
    -   `role`: (string) The role of the message sender, either `"system"`, `"user"`, or `"assistant"`.
        -   `system`: Provides initial instructions or context to the AI.
        -   `user`: Represents input from the end-user.
        -   `assistant`: Represents previous responses from the AI (not typically sent by the client for a new query, but part of the conversation context if maintained).
    -   `content`: (string or array) The content of the message.
        -   For text-only messages, this is a string.
        -   For messages including images (vision), this is an array containing a text part and an image URL part.
            -   `{ "type": "text", "text": "User's text query" }`
            -   `{ "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,BASE64_ENCODED_IMAGE_STRING" } }`
                -   The `url` for the image must be a base64 encoded data URI.
-   `max_tokens`: (integer) The maximum number of tokens (roughly, words or pieces of words) the AI should generate in its response. For medicoAI, this is typically set to `1000`.
-   `referrer`: (string, optional) An explicit identifier for the application (e.g., `"medicoAI"`).

**Example: Text-Only Query**

```json
{
  "model": "openai-large",
  "messages": [
    {
      "role": "system",
      "content": "You are medicoAI, a helpful assistant for medical students preparing for exams. Provide accurate answers and explanations in medicine."
    },
    {
      "role": "user",
      "content": "Explain the Krebs cycle."
    }
  ],
  "max_tokens": 1000,
  "referrer": "medicoAI"
}
```

**Example: Image + Text Query (Vision)**

```json
{
  "model": "openai-large",
  "messages": [
    {
      "role": "system",
      "content": "You are medicoAI, a helpful assistant for medical students preparing for exams. Provide accurate answers and explanations in medicine."
    },
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "What does this X-ray show?" },
        {
          "type": "image_url",
          "image_url": { "url": "data:image/jpeg;base64,BASE64_ENCODED_IMAGE_STRING" }
        }
      ]
    }
  ],
  "max_tokens": 1000,
  "referrer": "medicoAI"
}
```

## 6. Response Format (Success)

Upon a successful request, the API returns a JSON object that is compatible with OpenAI's chat completion response format.

The most important part of the response is the AI-generated message content.

**Simplified Example of a Success Response:**

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "The Krebs cycle, also known as the citric acid cycle, is a series of chemical reactions used by all aerobic organisms to release stored energy through the oxidation of acetyl-CoA derived from carbohydrates, fats, and proteins into adenosine triphosphate (ATP) and carbon dioxide."
      },
      "finish_reason": "stop"
      // Other fields like index, logprobs might be present
    }
  ]
  // Other top-level fields like id, created, model, etc., might be present
}
```

The actual textual response from the AI assistant is found at `response.choices[0].message.content`.

## 7. Error Handling

The medicoAI frontend (`script.js`) includes logic to handle potential errors during API interaction:

-   **API Errors:** If the API returns a non-200 HTTP status code (e.g., 4xx or 5xx errors), the application will catch this and display a user-friendly error message in the chat interface, often including the status code.
-   **Network Failures:** If there's an issue with the network connection preventing the `fetch` call from completing, this will also be caught, and a relevant error message will be shown to the user.

## 8. Markdown Rendering in Responses

Currently, the Pollination AI API returns responses as plain text. The `displayMessage` function in medicoAI's `script.js` renders this text content directly into the HTML of the message bubble. No specific Markdown-to-HTML conversion is performed by the frontend at this time. If the API were to return HTML formatted content, it would be rendered as such due to the use of `innerHTML`.The `API_DOCUMENTATION.md` file has been created in the previous turn with all the specified sections and content.

I will review the generated Markdown file against the requirements to ensure accuracy and completeness.

**Review of `API_DOCUMENTATION.md`:**

1.  **Filename:** `API_DOCUMENTATION.md` - **Done.**
2.  **Introduction:**
    *   States medicoAI uses Pollination AI. **Done.**
    *   Mentions communication via OpenAI-compatible POST endpoint. **Done.**
3.  **Authentication:**
    *   Explains referrer-based authentication and automatic `Referer` header. **Done.**
    *   Mentions optional `referrer: "medicoAI"` in JSON payload. **Done.**
4.  **Primary AI Model Used:**
    *   Name: OpenAI GPT-4.1 (as "openai-large"). **Done.**
    *   Identifier: `openai-large`. **Done.**
    *   Key Capabilities: Text understanding, generation, vision, medical Q&A. **Done.**
5.  **API Endpoint:**
    *   URL: `POST https://text.pollinations.ai/openai`. **Done.**
    *   Method: `POST`. **Done.**
6.  **Request Format:**
    *   **Headers:** `Content-Type: application/json`. **Done.**
    *   **Body (JSON):**
        *   Example for text-only query provided and matches `script.js` structure. **Done.**
        *   Example for image + text query (vision) provided and matches `script.js` structure, including the `data:image/jpeg;base64,...` format. **Done.**
        *   Explanation of key fields (`model`, `messages` with `role` and `content` structure including vision part, `max_tokens`, `referrer`). **Done.**
7.  **Response Format (Success):**
    *   Explains OpenAI chat completion compatibility. **Done.**
    *   Simplified success response example highlighting `choices[0].message.content`. **Done.**
    *   Note about actual content location `response.choices[0].message.content`. **Done.**
8.  **Error Handling:**
    *   Mentions `script.js` logic for API errors and network failures. **Done.**
    *   Mentions display of user-friendly error message. **Done.**
9.  **Markdown Rendering in Responses:**
    *   States API returns plain text and `displayMessage` renders it (using `innerHTML`). **Done.** This accurately reflects the current state where no explicit Markdown parser is used on the frontend.

All sections are present, the content aligns with the information from `script.js` and the prompt, and Markdown formatting (headings, code blocks, lists) is used correctly. The documentation provides a clear guide for a developer on how the frontend interacts with the backend.

No further modifications seem necessary.
