# Part 3: Add AI Capabilities

## ✅ Goals

- Integrate Workers AI and AI Gateway for LLM inference

## 🛠️ Instructions

1. To start using Cloudflare AI in your app, you first need to add the `ai` binding to the wrangler configuration file. this will set up a binding to Cloudflare's AI models in your code so you cab uses it to interact with the AI models on the platform.

```json
{
	"ai": {
		"binding": "AI"
	}
}
```

2. Now you can use the Workers AI built-in model:

Use `@cf/meta/llama-3.1-8b-instruct-fast` to run a basic text generation task.

```ts
app.post('/api/chat', async (c) => {
	const { message } = await c.req.json();

	try {
		const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
			messages: [{ role: 'user', content: message }],
		});

		console.log(response)

		return c.json({ message: response.response });
	} catch (error) {
		console.error('AI Error, error');
		return c.json({ error: 'Failed to generate response' }, 500);
	}
});
```

3. Set up AI Gateway:

To set up AI Gateway, [create an API Token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with the following permissions:

```
AI Gateway - Read
AI Gateway - Edit
```

- Add your API Key in `.dev.vars`

```env
AI_GATEWAY_API_KEY=your-api-key
```

- Update your handler to make a fetch request to AI gateway endpoint(OpenAI/ Anthropic)

4. Test both routes and compare local model vs external model.
