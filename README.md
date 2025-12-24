# AI Cloudflare App Builder

An intelligent assistant that helps you design and build Cloudflare Workers applications with AI capabilities. This application demonstrates the power of combining Cloudflare Workers, Workers AI, Durable Objects, and static assets to create a sophisticated conversational AI experience.

## What It Does

The AI Cloudflare App Builder is a chat-based assistant that:

- **Understands your requirements**: Describe what you want to build in natural language
- **Suggests architecture**: Recommends the appropriate Cloudflare services (Workers, Durable Objects, Workers AI, R2, KV, etc.)
- **Provides file structures**: Shows you exactly what files you need and where they should go
- **Generates code examples**: Offers production-ready TypeScript code following best practices
- **Maintains conversation context**: Remembers previous messages in your session using Durable Objects

Perfect for developers who want to quickly prototype Cloudflare Workers applications or learn how to integrate Workers AI into their projects.

## Architecture

The application follows a modern serverless architecture:

```
┌─────────────────┐
│  Static Assets  │  HTML/CSS/JS chat interface
│  (index.html)   │  Served by Cloudflare Workers
└────────┬────────┘
         │
         │ POST /api/chat
         ↓
┌─────────────────┐
│ Cloudflare      │  Routes requests, orchestrates AI
│ Worker          │  and storage interactions
│ (index.ts)      │
└────┬───────┬────┘
     │       │
     │       └──────────────┐
     ↓                      ↓
┌─────────────┐    ┌─────────────────┐
│ Workers AI  │    │ Durable Object  │
│ (Llama 3.3) │    │ (Conversation   │
│             │    │  Memory)        │
└─────────────┘    └─────────────────┘
```

### Components

1. **Static Assets** (`worker/public/index.html`)
   - Responsive chat interface
   - Sends user messages to `/api/chat`
   - Persists `sessionId` in browser localStorage
   - Displays conversation history

2. **Cloudflare Worker** (`worker/src/index.ts`)
   - Handles `POST /api/chat` endpoint
   - Manages session creation with unique IDs
   - Interfaces with Durable Objects for memory
   - Calls Workers AI (Llama 3.3) for response generation
   - Returns JSON responses to the frontend

3. **Workers AI**
   - Uses `@cf/meta/llama-3.3-70b-instruct-fp8-fast` model
   - Receives system prompt and conversation history
   - Generates intelligent, context-aware responses
   - Optimised for low latency and high throughput

4. **Durable Object** (`MyDurableObject` class)
   - Stores conversation history per session
   - Methods: `getHistory()`, `addMessage()`, `clearHistory()`
   - Persists data in Durable Object storage
   - Each session gets its own isolated instance

## How to Run Locally

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A Cloudflare account (for Workers AI binding)

### Steps

1. **Navigate to the worker directory**:
   ```bash
   cd worker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Authenticate with Cloudflare** (first time only):
   ```bash
   npx wrangler login
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   npx wrangler dev
   ```

5. **Open your browser**:
   - Navigate to `http://localhost:8787`
   - Start chatting with the AI assistant!

### Development Modes

#### Full Mode (Recommended)
- Command: `npx wrangler dev`
- ✅ Real AI responses using Llama 3.3
- ✅ Local Durable Objects
- ✅ Assets served correctly
- Requires: Authentication via `wrangler login`

#### Local Mode (Fallback)
- Command: `npx wrangler dev --local`
- ✅ Works without authentication
- ✅ Detailed mock responses for testing UI
- ❌ No real AI (uses intelligent mock responses)
- ❌ Assets may not work properly

### Development Notes

- The development server uses local bindings for Durable Objects
- Workers AI runs remotely even in dev mode (incurs minimal charges)
- Changes to `index.ts` will trigger hot reloading
- Changes to `index.html` require a manual refresh
- Mock responses are generated for local testing without authentication

## How to Deploy

### Prerequisites

- Cloudflare account with Workers AI enabled
- Wrangler CLI authenticated (`wrangler login`)

### Deployment Steps

1. **Ensure you're in the worker directory**:
   ```bash
   cd worker
   ```

2. **Deploy to Cloudflare**:
   ```bash
   npm run deploy
   # or
   wrangler deploy
   ```

3. **Access your deployed application**:
   - Wrangler will output your Worker's URL (e.g., `https://worker.<your-subdomain>.workers.dev`)
   - Open the URL in your browser

### Post-Deployment

- Your Durable Objects will automatically migrate using the configuration in `wrangler.jsonc`
- Each user session creates a unique Durable Object instance
- Workers AI requests are billed per inference token

## Configuration

### Workers AI Binding

The AI binding is configured in `wrangler.jsonc`:

```jsonc
"ai": {
  "binding": "AI"
}
```

### Durable Objects

Durable Object configuration in `wrangler.jsonc`:

```jsonc
"durable_objects": {
  "bindings": [
    {
      "class_name": "MyDurableObject",
      "name": "MY_DURABLE_OBJECT"
    }
  ]
},
"migrations": [
  {
    "new_sqlite_classes": ["MyDurableObject"],
    "tag": "v1"
  }
]
```

## Project Structure

```
cf_ai_app_builder/
├── README.md                  # This file
├── PROMPTS.md                 # System prompts and examples
└── worker/
    ├── package.json           # Dependencies
    ├── tsconfig.json          # TypeScript configuration
    ├── wrangler.jsonc         # Cloudflare Workers config
    ├── public/
    │   └── index.html         # Chat UI (HTML/CSS/JS)
    └── src/
        └── index.ts           # Worker + Durable Object code
```

## Features

- ✅ **Conversational AI**: Powered by Llama 3.3 via Workers AI
- ✅ **Persistent Memory**: Durable Objects store conversation history
- ✅ **Session Management**: Each user gets a unique session ID
- ✅ **Responsive UI**: Clean, modern chat interface
- ✅ **TypeScript**: Fully typed for better developer experience
- ✅ **Zero Framework**: Pure HTML/CSS/JS on the frontend
- ✅ **British English**: Consistent language throughout
- ✅ **Clear Conversation**: Reset and start fresh anytime

## API Endpoints

### `POST /api/chat`

Send a message to the AI assistant.

**Request**:
```json
{
  "message": "I want to build a URL shortener",
  "sessionId": "optional-existing-session-id"
}
```

**Response**:
```json
{
  "reply": "Great! Let me help you design a URL shortener...",
  "sessionId": "unique-session-id"
}
```

### `POST /api/clear`

Clear conversation history for a session.

**Request**:
```json
{
  "sessionId": "your-session-id"
}
```

**Response**:
```json
{
  "success": true
}
```

## Technologies Used

- **Cloudflare Workers**: Serverless compute platform
- **Workers AI**: LLM inference at the edge (Llama 3.3)
- **Durable Objects**: Consistent, low-latency storage
- **TypeScript**: Type-safe development
- **Wrangler**: CLI for Cloudflare Workers development

## Licence

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions:
- **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Workers AI**: https://developers.cloudflare.com/workers-ai/
- **Durable Objects**: https://developers.cloudflare.com/durable-objects/
- **Wrangler**: https://developers.cloudflare.com/workers/wrangler/

## Project Info

- **Built with**: Cloudflare Workers, Workers AI (Llama 3.3 70B), Durable Objects
- **Development Assistant**: Claude 3.5 Sonnet (Anthropic)
- **Development Date**: December 24, 2025
- **Language**: TypeScript
- **UI Style**: British English

---

**Built with ☁️ by Cloudflare Workers**

