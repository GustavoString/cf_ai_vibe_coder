# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Cannot read properties of undefined (reading 'fetch')" - ASSETS Error

**Problem:** `env.ASSETS.fetch` fails in `--local` mode

**Solution:** Don't use `--local` flag. Run with:
```bash
npx wrangler dev
```

Assets only work in standard dev mode, not `--local` mode.

---

### 2. "You need to register a workers.dev subdomain"

**Problem:** Need to set up Cloudflare Workers subdomain

**Solutions:**
1. **Authenticate first:**
   ```bash
   npx wrangler login
   ```

2. **Register subdomain:**
   - Visit: https://dash.cloudflare.com/
   - Go to Workers & Pages
   - Complete the onboarding to register your subdomain

---

### 3. "Workers AI unavailable" - Mock Responses

**Problem:** Running in `--local` mode shows mock responses

**Why:** Workers AI cannot run locally, it always connects remotely

**Solutions:**
1. **Use real AI (recommended):**
   ```bash
   npx wrangler login
   npx wrangler dev
   ```

2. **Continue with mocks for UI testing:**
   - Mock responses are detailed and helpful for development
   - Deploy to get real AI: `npx wrangler deploy`

---

### 4. SSL/TLS Handshake Failure

**Problem:** `ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE`

**Solutions:**
1. **Update Node.js:**
   ```bash
   node --version  # Should be v18+
   ```

2. **Check firewall/antivirus:**
   - May be blocking Cloudflare API connections
   - Temporarily disable to test

3. **Try local mode:**
   ```bash
   npx wrangler dev --local
   ```

---

### 5. "You need to verify your email address"

**Problem:** Cloudflare account email not verified

**Solution:**
1. Check your email for verification link
2. Visit: https://dash.cloudflare.com/
3. Look for verification banner
4. Complete email verification
5. Try again: `npx wrangler dev`

---

### 6. Types Out of Date Warning

**Problem:** `Your types might be out of date`

**Solution:**
```bash
npm run cf-typegen
# or
npx wrangler types
```

This regenerates TypeScript type definitions.

---

### 7. AI Responses Getting Cut Off / Truncated

**Problem:** AI responses end abruptly mid-sentence or mid-code block

**Cause:** Default `max_tokens` limit is too low for detailed responses

**Status:** ✅ Fixed in latest version!

**Solutions Applied:**
1. **Increased max_tokens:**
   ```typescript
   const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
     messages,
     max_tokens: 2048  // Increased from default ~512
   });
   ```

2. **Updated system prompt:**
   - Added instruction to provide complete responses
   - Emphasizes finishing code blocks and explanations

3. **Frontend formatting:**
   - Added markdown support for proper code block rendering
   - Preserves line breaks and formatting

**Result:** Responses now include complete code examples, full file structures, and detailed explanations.

---

### 8. 503 Error on Favicon

**Problem:** Browser requests `/favicon.ico` and gets 503 Service Unavailable

**Cause:** No favicon file in assets, and no handler for the route

**Status:** ✅ Fixed!

**Solutions Applied:**
1. **Added favicon handler:**
   ```typescript
   if (url.pathname === "/favicon.ico") {
     return new Response(null, { status: 204 });
   }
   ```

2. **Created favicon.svg:**
   - Added emoji favicon (🤖) to `public/favicon.svg`
   - Referenced in HTML `<head>`

**Result:** No more 503 errors, proper favicon displays in browser tab.

---

### 9. Mock Responses Not Detailed Enough

**Problem:** Local mode gives basic responses

**Status:** ✅ Fixed in latest version!

The mock response generator now provides:
- Detailed architecture recommendations
- Complete code examples
- File structures
- Deployment instructions

To get real AI responses: `npx wrangler deploy`

---

## Best Practices

### For Development
```bash
cd worker
npx wrangler login          # One-time setup
npx wrangler dev            # Standard dev mode
```

### For Testing Without Auth
```bash
npx wrangler dev --local    # Mock responses, no auth needed
```

### For Production
```bash
npx wrangler deploy         # Deploy to Cloudflare
```

---

## Command Reference

| Command | AI Responses | Assets | Auth Required |
|---------|-------------|---------|---------------|
| `wrangler dev` | ✅ Real | ✅ Yes | ✅ Yes |
| `wrangler dev --local` | ❌ Mock | ❌ Limited | ❌ No |
| `wrangler deploy` | ✅ Real | ✅ Yes | ✅ Yes |

---

## Getting Help

1. **Check wrangler logs:**
   ```bash
   # Logs are written to:
   # Windows: %APPDATA%\xdg.config\.wrangler\logs\
   ```

2. **Enable verbose logging:**
   ```bash
   npx wrangler dev --log-level debug
   ```

3. **Cloudflare Documentation:**
   - Workers: https://developers.cloudflare.com/workers/
   - Workers AI: https://developers.cloudflare.com/workers-ai/
   - Durable Objects: https://developers.cloudflare.com/durable-objects/

4. **Report Issues:**
   - Wrangler: https://github.com/cloudflare/workers-sdk/issues
   - This project: Create an issue in your repository

