import { DurableObject } from "cloudflare:workers";

/**
 * Conversation memory stored in Durable Object
 */
interface Message {
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: number;
}

/** A Durable Object that stores conversation history */
export class MyDurableObject extends DurableObject {
	/**
	 * The constructor is invoked once upon creation of the Durable Object
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 */
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	/**
	 * Get conversation history from storage
	 * @returns Array of messages
	 */
	async getHistory(): Promise<Message[]> {
		const history = await this.ctx.storage.get<Message[]>("history");
		return history || [];
	}

	/**
	 * Add a message to conversation history
	 * @param message - The message to add
	 */
	async addMessage(message: Message): Promise<void> {
		const history = await this.getHistory();
		history.push(message);
		await this.ctx.storage.put("history", history);
	}

	/**
	 * Clear conversation history
	 */
	async clearHistory(): Promise<void> {
		await this.ctx.storage.delete("history");
	}
}

/**
 * System prompt for the AI app builder
 */
const SYSTEM_PROMPT = `You are an expert Cloudflare AI App Builder assistant. Your role is to help users design and build Cloudflare Workers applications that use AI capabilities.

When users describe what they want to build, you should:

1. Analyse their requirements and suggest an architecture using:
   - Cloudflare Workers for serverless compute
   - Workers AI for LLM inference (recommend appropriate models like Llama 3.3)
   - Durable Objects for state management and coordination
   - Assets for serving static HTML/CSS/JS interfaces

2. Provide a clear file structure for their project, showing what files they need and where they go.

3. Offer TypeScript code examples that are:
   - Production-ready and well-commented
   - Following Cloudflare Workers best practices
   - Using British English in comments and user-facing text
   - Minimal and without unnecessary frameworks

4. Explain how different components work together (e.g., how the frontend calls the Worker, how the Worker uses Durable Objects, how to integrate Workers AI).

5. Suggest appropriate Workers AI models based on the use case (text generation, embeddings, image classification, etc.).

IMPORTANT: Always provide complete, detailed responses. Include full code examples and finish your thoughts. Don't cut off mid-sentence or mid-code block. Ensure file structures, code samples, and explanations are comprehensive and actionable.

Be concise yet thorough, practical, and focus on actionable guidance. Use British English spelling and terminology throughout.`;

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
	return crypto.randomUUID();
}

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request, env, _ctx): Promise<Response> {
		const url = new URL(request.url);

		// Handle favicon.ico to prevent 503 errors
		if (url.pathname === "/favicon.ico") {
			return new Response(null, { status: 204 });
		}

		// Handle POST /api/chat
		if (url.pathname === "/api/chat" && request.method === "POST") {
			try {
				const body = await request.json() as { message: string; sessionId?: string };
				const { message, sessionId: inputSessionId } = body;

				if (!message) {
					return Response.json({ error: "Message is required" }, { status: 400 });
				}

				// Generate or use existing session ID
				const sessionId = inputSessionId || generateSessionId();

				// Get the Durable Object stub for this session
				const id = env.MY_DURABLE_OBJECT.idFromName(sessionId);
				const stub = env.MY_DURABLE_OBJECT.get(id);

				// Get conversation history
				const history = await stub.getHistory();

				// Build messages array for AI
				const messages: { role: string; content: string }[] = [
					{ role: "system", content: SYSTEM_PROMPT },
				];

				// Add history (limit to last 10 messages to avoid token limits)
				const recentHistory = history.slice(-10);
				for (const msg of recentHistory) {
					if (msg.role !== "system") {
						messages.push({ role: msg.role, content: msg.content });
					}
				}

				// Add current user message
				messages.push({ role: "user", content: message });

			// Call Workers AI using Llama 3.3
			let reply: string;
			try {
				const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
					messages,
					max_tokens: 2048, // Allow longer responses (default is often too short)
				});
				// Extract the response
				reply = (aiResponse as any).response || "Sorry, I couldn't generate a response.";
			} catch (aiError: any) {
				// Fallback for local development when AI binding is unavailable
				console.warn("Workers AI unavailable, using mock response:", aiError.message);
				reply = `[Mock Response - Workers AI unavailable in local mode]

Based on your request: "${message}"

Here's a suggested architecture for your Cloudflare Workers application:

**Architecture:**
- Cloudflare Workers for serverless compute
- Workers AI with Llama 3.3 for LLM inference
- Durable Objects for state management
- Static Assets for serving the UI

**File Structure:**
\`\`\`
my-app/
├── src/
│   └── index.ts (Worker entry point)
├── public/
│   └── index.html (Frontend UI)
└── wrangler.jsonc (Configuration)
\`\`\`

**Next Steps:**
1. Define your data models
2. Implement the Worker API routes
3. Create the Durable Object for state
4. Build the frontend interface

To test with real AI responses, deploy using \`npm run deploy\` or authenticate with \`npx wrangler login\`.`;
			}

				// Save messages to Durable Object
				await stub.addMessage({
					role: "user",
					content: message,
					timestamp: Date.now(),
				});

				await stub.addMessage({
					role: "assistant",
					content: reply,
					timestamp: Date.now(),
				});

				return Response.json({
					reply,
					sessionId,
				});
			} catch (error: any) {
				console.error("Error in /api/chat:", error);
				return Response.json(
					{ error: "Failed to process chat message", details: error.message },
					{ status: 500 }
				);
			}
		}

		// Handle GET /api/clear for clearing conversation
		if (url.pathname === "/api/clear" && request.method === "POST") {
			try {
				const body = await request.json() as { sessionId: string };
				const { sessionId } = body;

				if (!sessionId) {
					return Response.json({ error: "Session ID is required" }, { status: 400 });
				}

				const id = env.MY_DURABLE_OBJECT.idFromName(sessionId);
				const stub = env.MY_DURABLE_OBJECT.get(id);
				await stub.clearHistory();

				return Response.json({ success: true });
			} catch (error: any) {
				console.error("Error in /api/clear:", error);
				return Response.json(
					{ error: "Failed to clear conversation", details: error.message },
					{ status: 500 }
				);
			}
		}

		// All other requests are handled by the static assets
		// In local mode, ASSETS may not be available, so check first
		if (env.ASSETS) {
			return env.ASSETS.fetch(request);
		}

		// Fallback for when ASSETS is not available
		return new Response('Asset serving not available in this mode. Try: wrangler dev (without --local)', {
			status: 503,
			headers: { 'Content-Type': 'text/plain' }
		});
	},
} satisfies ExportedHandler<Env>;
