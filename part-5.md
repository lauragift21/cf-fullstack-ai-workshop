# 💬 Part 5: Build the RAG Chat Endpoint

## ✅ Goals

- Let users ask questions in natural language
- Use Vectorize to retrieve the most relevant document chunks
- Use Workers AI to generate answers grounded in the retrieved content
- Return the result to the frontend

## 🛠️ Instructions

### 1. Implement the `/api/chat` endpoint

In your `index.ts`, replace your existing chat route with the following RAG-enabled logic:

```ts
app.post('/api/chat', async (c) => {
  const env = c.env;
  const { question } = await c.req.json();

  try {
    // Step 1: Embed the user question
    const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: question,
    });
    const queryEmbedding = embeddingResponse.data[0];

    // Step 2: Query Vectorize for relevant context
    const vectorResult = await env.VECTORIZE.query(queryEmbedding, {
      topK: 3,
      returnValues: true,
      returnMetadata: 'all',
    });

    const matches = vectorResult.matches || [];
    const contextChunks = matches.map((m) => m.metadata?.text).filter(Boolean);

    // Step 3: Format context for the AI model
    const contextBlock = contextChunks.length
      ? `Context:\n${contextChunks.map((chunk) => `- ${chunk}`).join('\n')}`
      : 'No relevant context found.';

    const prompt = [
      { role: 'system', content: contextBlock },
      { role: 'user', content: question },
    ];

    // Step 4: Generate AI response
    const response = await env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages: prompt,
      },
      {
        gateway: {
          id: 'cf-gateway', // Replace with your Gateway ID
          skipCache: true,
        },
      },
    );

    return c.json({
      message: response
      context: contextChunks,
    });
  } catch (err) {
    console.error('RAG error:', err);
    return c.json({ error: 'Failed to generate response' }, 500);
  }
});
```

Then deploy your Worker:

```bash
npm run deploy
```

## ✅ Summary

You’ve now built a full-stack RAG (Retrieval-Augmented Generation) chat system:

- 💬 Users send a question
- 🧠 It’s embedded and matched against your vector store
- 🔍 Relevant content is retrieved and passed into the AI model
- 🤖 The AI generates a grounded response
- 🌐 The frontend receives the answer + matched context

All powered by Cloudflare Workers, Vectorize, Workflows, and Workers AI.
