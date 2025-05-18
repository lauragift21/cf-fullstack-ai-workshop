import { Hono } from 'hono';

type Env = {
	AI: Ai
}

const app = new Hono<{ Bindings: Env }>();

app.post('/api/documents', async (c) => {
	// Document upload handling - will implement later
	return c.json({ success: true, message: 'Document received' });
});

app.post('/api/chat', async (c) => {
	const ai = c.env.AI;

	const { message } = await c.req.json();

	try {
		const response = await ai.run(
			'@cf/meta/llama-3.3-70b-instruct-fp8-fast',
			{
				messages: [
					{ role: 'system', content: 'You are a helpful assistant' },
					{ role: 'user', content: message },
				],
			},
			{
				gateway: {
					id: 'cf-gateway',
					skipCache: true, // Optional: Skip cache if needed
				},
			}
		);

		return c.json({ message: response.response });
	} catch (error) {
		console.error('AI Error:', error);
		return c.json({ error: 'Failed to generate response' }, 500);
	}
});

export default app;
