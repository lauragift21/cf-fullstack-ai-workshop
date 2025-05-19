import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

type Params = {
  documentId: string;
  title: string;
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
	const title = (formData.get('title') as string) || file.name;
	const documentId = nanoid();

	await c.env.DB.prepare(
		`
    INSERT INTO documents (id, title, content, created_at) VALUES (? ? ? ?)`
	)
		.bind(documentId, title, content, Date.now())
		.run();

	// Start the document processing workflow
	await c.env.DOCUMENT_PROCESSING.create({ params: { documentId, content } });

	return c.json({ success: true, documentId, message: 'Processing Started' });
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

export class DocumentProcessingWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { documentId, title, content } = event.params;
    const env = this.env;
    
    if (env.ENABLE_TEXT_SPLITTING) {
      const chunks = await step.do('Chunk content', async () => {
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 100,
          separators: ['\n\n', '\n', ' ', ''],
        });

        const docs = await splitter.createDocuments([content]);
        return docs.map((doc) => doc.pageContent);
      });

      console.log(`🔹 Generated ${chunks.length} chunks`);
    
    for (const index in chunks) {
      const text = chunks[index];
      const record = await step.do('Create Record', async () => {
        const query = await env.DB.prepare(
          `INSERT INTO documents (id, title, content, created_at) VALUES (? ? ? ?)`
        )
        .bind(documentId, title, text, Date.now())
          .run();
        
        return {
          id: record.id,
          text,
          metadata: {
            documentId,
            
          }
        }
        
      

		// Step 1: Chunk the document using Langchain's text splitter
		const chunks = await step.do('Chunk Document', async () => {
			const splitter = new RecursiveCharacterTextSplitter({
				chunkSize: 1000,
				chunkOverlap: 100,
				separators: ['\n\n', '\n', ' ', ''],
			});
			return splitter.splitText(content);
		});

		// Step 2: Generate embeddings for each chunk and store in Vectorize
		await step.do('Embed and Store Chunks', async () => {
			let chunkIndex = 0;
			for (const chunk of chunks) {
				const embedding = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
					text: chunk,
				});

				await this.env.VECTORIZE.insert({
					id: `${documentId}-chunk-${chunkIndex}`,
					values: embedding.data[0],
					metadata: {
						documentId,
						chunkIndex,
						text: chunk,
					},
				});
				chunkIndex++;
			}
		});
	}
}
export default app;
