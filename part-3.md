# 🧠 Part 3: Add AI Capabilities

## ✅ Goals

- Integrate Workers AI for text generation

- Create a `/api/chat`endpoint that accepts user input and responds with AI-generated content

- Learn how to set up AI Gateway

## 🛠️ Instructions

### 1. **Update wrangler.jsonc to enable Workers AI**

Add the `ai` binding if it's not already there:

```json
"ai": {
  "binding": "AI"
}
```

This makes `c.env.AI` available in your Worker.

### 2. **Add a basic chat endpoint**

Update your Hono app to include a simple `/api/chat` route:

```ts
interface Env {
  AI: Ai;
}

const app = new Hono<{ Bindings: Env }>();

app.post('/api/chat', async (c) => {
  const ai = c.env.AI;
  const { message } = await c.req.json();

  try {
    const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message },
      ],
    });

    return c.json({ message: response });
  } catch (error) {
    console.error('AI Error:', error);
    return c.json({ error: 'Failed to generate response' }, 500);
  }
});
```

### 3. **Connect your frontend to the `/api/chat` route**

In `public/app.js`, update your form handler:

```ts
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();

  if (!message) return;

  addMessage(message, 'user');
  userInput.value = '';

  const typingEl = addMessage('Assistant is thinking...', 'assistant', true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();
    const response = data.message?.response || 'No response received.';
    typingEl.innerHTML = marked.parse(response);
  } catch (error) {
    console.error('Chat error:', error);
    typingEl.innerHTML = 'Failed to get a response. Please try again.';
  }
});
```

This will display the AI's response in the chat interface after a short delay.

### 4. **Set Up AI Gateway**

Go to the [Cloudflare Dashboard → AI Gateway](https://dash.cloudflare.com/) and create a new Gateway. Give it a name like `cf-gateway`.

Then, in your Worker code, pass the Gateway ID as part of the `run()` call like this:

```ts
const response = await ai.run(
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: message },
    ],
  },
  {
    gateway: {
      id: 'cf-gateway', // Replace with your Gateway ID
      skipCache: true, // Optional: disables caching
    },
  },
);
```

> 🧠 This tells Workers AI to route the request through your Gateway — enabling usage tracking, rate limiting, caching, and model provider control.
