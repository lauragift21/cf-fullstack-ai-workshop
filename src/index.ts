import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

type Document = {
  id: string;
  title: string;
  content: string;
  created_at: number;
};

type Params = {
  content: string;
};

const app = new Hono<{ Bindings: Env }>();

app.post('/api/documents', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('document');

  if (!file || typeof file === 'string') {
    return c.json({ error: 'No file provided' }, 400);
  }

  const content = await file.text();
  // Start the document processing workflow
  await c.env.DOCUMENT_PROCESSING.create({ params: { content } });
  return c.json({ success: true, message: 'Processing Started' });
});

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
      returnMetadata: 'all',
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

    const response = await env.AI.run(
      '@cf/meta/llama-4-scout-17b-16e-instruct',
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
      message: response,
      context: contextChunks,
    });
  } catch (err) {
    console.error('RAG error:', err);
    return c.json({ error: 'Failed to generate response' }, 500);
  }
});

export class DocumentProcessingWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { content } = event.payload;
    const env = this.env;

    // Step 1: Split content into chunks
    const chunks = await step.do('Split document into chunks', async () => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
        separators: ['\n\n', '\n', ' ', ''],
      });

      const docs = await splitter.createDocuments([content]);
      return docs.map((doc) => doc.pageContent);
    });

    console.log(`📄 Split into ${chunks.length} document chunks`);

    // Step 2: Insert and process each chunk
    for (const index in chunks) {
      const chunk = chunks[index];
      const chunkId = nanoid();
      const chunkTitle = `Chunk ${+index + 1}`;

      // Insert chunk as a row in the existing `documents` table
      const record = await step.do(`Create database record ${+index + 1}/${chunks.length}`, async () => {
        const query = `INSERT INTO documents (id, title, content, created_at)
          VALUES (?, ?, ?, ?)
          RETURNING * `;
        const { results } = await env.DB.prepare(query).bind(chunkId, chunkTitle, chunk, Date.now()).run<Document>();

        const inserted = results?.[0];
        if (!inserted) throw new Error('Failed to create document');
        return inserted;
      });

      // Step 3: Generate embedding
      const embedding = await step.do(`Generate embedding ${+index + 1}/${chunks.length}`, async () => {
        const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
          text: chunk,
        });

        const values = embeddings.data[0];
        if (!values) throw new Error('Failed to generate vector embedding');
        return values;
      });

      // Step 4: Store in Vectorize
      await step.do(`Insert vector ${+index + 1}/${chunks.length}`, async () => {
        if (!record) throw new Error('No record found');
        return env.VECTORIZE.insert([
          {
            id: record.id.toString(),
            values: embedding,
            metadata: {
              text: chunk,
              chunkIndex: +index,
            },
          },
        ]);
      });
    }
  }
}

export default app;
