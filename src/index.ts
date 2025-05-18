import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.post('/api/documents', async (c) => {
	// Document upload handling - will implement later
	return c.json({ success: true, message: 'Document received' });
});

app.post('/api/chat', async (c) => {
	const { message } = await c.req.json();

	try {
		const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
			messages: [{ role: 'user', content: message }],
		});

		return c.json({ message: response.response });
	} catch (error) {
		console.error('AI Error:', error);
		return c.json({ error: 'Failed to generate response' }, 500);
	}
});

export default app;
