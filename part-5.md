# 💬 Part 5: Build the RAG Chat Endpoint

## ✅ Goals

- Let users ask questions in natural language
- Use Vectorize to retrieve the most relevant document chunks
- Use Workers AI to generate answers grounded in the retrieved content
- Return the result to the frontend

## 🛠️ Instructions

### 1. Implement `/api/chat` endpoint

In your `index.ts`, replace your existing basic chat route with this full RAG-enabled logic:

```ts
app.post('/api/chat', async (c) => {
  const env = c.env;
  const { question } = await c.req.json();

  try {
    const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: question,
    });
    const queryEmbedding = embeddingResponse.data[0];

    const vectorResult = await env.VECTORIZE.query(queryEmbedding, {
      topK: 3,
      returnValues: true,
    });

    const matches = vectorResult.matches || [];
    const contextChunks = matches.map((m) => m.metadata?.text).filter(Boolean);

    const contextBlock = contextChunks.length
      ? `Context:\n${contextChunks.map((chunk) => `- ${chunk}`).join('\n')}`
      : 'No relevant context found.';

    const prompt = [
      { role: 'system', content: contextBlock },
      { role: 'user', content: question },
    ];

    const aiResponse = await env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages: prompt,
      },
      {
        gateway: {
          id: 'cf-gateway', // Replace with your Gateway ID
          skipCache: true, // Optional: disables caching
        },
      },
    );

    return c.json({
      message: aiResponse.response,
      context: contextChunks,
    });
  } catch (err) {
    console.error('RAG error:', err);
    return c.json({ error: 'Failed to generate response' }, 500);
  }
});
```

### 2. Update Frontend Chat Logic

In `public/app.js`, you already have a form handler. Enhance it with loading feedback and display:

```js
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  addMessage(question, 'user');
  userInput.value = '';

  const loading = addMessage('Thinking...', 'assistant', true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    loading.innerHTML = marked.parse(data.message);
  } catch (err) {
    console.error(err);
    loading.innerHTML = 'Error retrieving response.';
  }
});
```

### ✅ Summary

By the end of this part:

- You’ve built a working full-stack RAG system
- User input → embedded → relevant chunks retrieved → AI-generated answer
- All served from your Cloudflare Worker
