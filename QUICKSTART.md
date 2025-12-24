# Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js v18 or later installed
- [ ] npm or yarn package manager
- [ ] Cloudflare account (free tier is fine)
- [ ] Wrangler CLI installed (included in project dependencies)

---

## Local Development (3 Steps)

### Step 1: Install Dependencies
```bash
cd worker
npm install
```

### Step 2: Login to Cloudflare (First Time Only)
```bash
npx wrangler login
```
This opens a browser window for authentication.

### Step 3: Start Development Server
```bash
npm run dev
```

**Expected output**:
```
⛅️ wrangler 4.x.x
Ready on http://localhost:8787
```

**Open**: http://localhost:8787 in your browser

---

## Deployment (2 Steps)

### Step 1: Ensure You're Logged In
```bash
npx wrangler whoami
```

### Step 2: Deploy
```bash
cd worker
npm run deploy
```

**Expected output**:
```
✨ Success! Deployed to https://worker.<your-subdomain>.workers.dev
```

---

## Testing the Application

### 1. Open the Chat Interface
- **Local**: http://localhost:8787
- **Production**: Your deployed Worker URL

### 2. Try a Simple Prompt
Type in the chat:
```
I want to build a URL shortener
```

### 3. Expected Response
The AI should respond with architecture recommendations, file structure, and code examples.

### 4. Test Memory
Ask a follow-up question:
```
How would I add user authentication?
```

The AI should remember the context (URL shortener) from your previous message.

### 5. Clear Conversation
Click the "Clear" button to reset and start fresh.

---

## Verifying Everything Works

### Check 1: Static Assets
- URL: http://localhost:8787
- Expected: Chat interface loads with purple gradient header
- Error: If you see "404" or blank page, check `public/index.html` exists

### Check 2: API Endpoint
```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```
Expected: JSON response with `reply` and `sessionId`

### Check 3: Durable Objects
- Send multiple messages in the chat
- Refresh the page
- Send another message
- The AI should remember previous context

### Check 4: Workers AI
- Send: "Suggest a Cloudflare Workers app idea"
- Expected: Detailed response about building on Cloudflare

---

## Common Issues & Solutions

### Issue: "Property 'AI' does not exist on type 'Env'"
**Solution**: Run `npm run cf-typegen` to regenerate types

### Issue: "Durable Object binding not found"
**Solution**: Check `wrangler.jsonc` has correct DO configuration and migration

### Issue: "Unauthorized" when deploying
**Solution**: Run `npx wrangler login` again

### Issue: Chat loads but messages don't send
**Solution**: 
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed /api/chat requests
4. Verify Workers AI is enabled in your Cloudflare account

### Issue: "Module not found" errors
**Solution**: 
```bash
cd worker
rm -rf node_modules package-lock.json
npm install
```

---

## Project Structure Quick Reference

```
cf_ai_app_builder/
├── README.md              ← Full documentation
├── PROMPTS.md             ← Example prompts and system prompt
├── IMPLEMENTATION.md      ← Technical implementation details
├── QUICKSTART.md          ← This file
└── worker/
    ├── package.json       ← Dependencies (wrangler, typescript)
    ├── wrangler.jsonc     ← Worker configuration
    ├── tsconfig.json      ← TypeScript settings
    ├── worker-configuration.d.ts  ← Generated types
    ├── public/
    │   └── index.html     ← Chat UI (HTML/CSS/JS)
    └── src/
        └── index.ts       ← Worker code + Durable Object
```

---

## Key Files to Understand

### `worker/src/index.ts`
- `SYSTEM_PROMPT`: Instructions for the AI
- `MyDurableObject`: Stores conversation history
- `fetch()` handler: Routes /api/chat requests

### `worker/public/index.html`
- Complete chat interface
- Handles user input and displays messages
- Manages sessionId in localStorage

### `worker/wrangler.jsonc`
- Binds Workers AI (`ai.binding = "AI"`)
- Configures Durable Objects
- Sets up asset serving

---

## Development Workflow

### Making Changes to the Backend
1. Edit `worker/src/index.ts`
2. Wrangler dev auto-reloads
3. Test in browser

### Making Changes to the Frontend
1. Edit `worker/public/index.html`
2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Test changes

### Changing the System Prompt
1. Edit `SYSTEM_PROMPT` in `worker/src/index.ts`
2. Save the file (wrangler auto-reloads)
3. Start a new conversation or clear existing one
4. Test new behaviour

### Adding New API Routes
1. Add route handler in `fetch()` function
2. Update types if needed (`npm run cf-typegen`)
3. Test with curl or fetch from browser console

---

## Useful Commands

### View Logs (During Development)
Logs appear in the terminal where you ran `npm run dev`

### View Logs (Production)
```bash
npx wrangler tail
```

### Generate Types
```bash
npm run cf-typegen
```

### Deploy a Specific Environment
```bash
npx wrangler deploy --env production
```

### Check Wrangler Version
```bash
npx wrangler --version
```

---

## Next Steps

Once you have the application running:

1. **Read PROMPTS.md**: Learn how to interact with the AI effectively
2. **Try example prompts**: Test different use cases
3. **Customise the system prompt**: Tailor it to your needs
4. **Experiment with the UI**: Modify colours, layout, etc.
5. **Add features**: Streaming responses, file uploads, etc.

---

## Getting Help

- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Workers AI**: https://developers.cloudflare.com/workers-ai/
- **Durable Objects**: https://developers.cloudflare.com/durable-objects/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

---

## Cost Estimate (Free Tier)

- **Workers**: 100,000 requests/day free
- **Workers AI**: 10,000 neurons/day free (~ hundreds of AI requests)
- **Durable Objects**: 1 million requests/month free + storage
- **Assets**: Included with Workers

**Typical usage**: A few dozen conversations/day easily fits in free tier.

---

**You're all set! Start building with AI on Cloudflare Workers.** ☁️🚀

