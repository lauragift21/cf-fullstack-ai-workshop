# 📦 Part 4: Upload Documents and Process with Cloudflare Workflows

## ✅ Goals

In this section, we will:

- Set up Cloudflare D1 and Vectorize
- Enable file uploads from the frontend
- Trigger a Cloudflare Workflow that:

  - Chunk the content using LangChain
  - Store each chunk in D1
  - Generate embeddings using Workers AI
  - Store vectors in Vectorize

## 🛠️ Instructions

### 1. Set up D1 and Vectorize

#### Create a D1 Database

```bash
npx wrangler d1 create knowledgebase-db
```

This returns a `database_id` — you’ll need it in your config.

#### Create a Vectorize Index

```bash
npx wrangler vectorize create knowledgebase-vectors --remote --dimensions=768 --metric=cosine
```

#### Add D1 Schema

Create a `schema.sql` file in your project root:

```sql
DROP TABLE IF EXISTS documents;

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

Then run this to apply the schema:

```bash
npx wrangler d1 execute knowledgebase-db --file=./schema.sql
```
 > To apply it to your remote database instead of local, add the --remote flag.


#### Add Bindings to `wrangler.jsonc`

Update your config file with the necessary D1 and Vectorize bindings:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "knowledgebase-db",
      "database_id": "your-database-id",
    },
  ],
  "vectorize": [
    {
      "binding": "VECTORIZE",
      "index_name": "knowledgebase-vectors",
    },
  ],
}
```

### 2. Add an Upload Endpoint

This route handles document uploads and saves them in your D1 database:

```ts
type Document = {
  id: string;
  title: string;
  content: string;
  created_at: number;
};

app.post('/api/documents', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('document');

  if (!file || typeof file === 'string') {
    return c.json({ error: 'No file provided' }, 400);
  }

  const content = await file.text();
  const id = crypto.randomUUID();
  const title = formData.get('title') || 'Untitled';

  await c.env.DB.prepare(
    `INSERT INTO documents (id, title, content, created_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(id, title, content, Date.now())
    .run();

  return c.json({ success: true, documentId: id });
});
```

### 3. Update the Frontend Upload Form

Add JavaScript to handle document uploads on the frontend:

```js
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('document-upload');

  if (fileInput.files.length === 0) {
    alert('Please select a file to upload');
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('document', file);
  formData.append('title', file.name);

  // Show upload status
  const statusElem = document.createElement('div');
  statusElem.textContent = `Uploading ${file.name}...`;
  statusElem.classList.add('upload-status');
  uploadForm.appendChild(statusElem);

  try {
    const response = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const result = await response.json();

    // Update status
    statusElem.textContent = `✓ ${file.name} uploaded successfully!`;
    statusElem.classList.add('success');

    // Add to documents list
    const listItem = document.createElement('li');
    listItem.textContent = file.name;
    listItem.dataset.documentId = result.documentId;
    documentsList.appendChild(listItem);

    // Reset file input
    fileInput.value = '';
  } catch (error) {
    console.error('Upload error:', error);
    statusElem.textContent = `✗ Failed to upload ${file.name}`;
    statusElem.classList.add('error');
  }
});
```

You can check the file ypu uploaded with the following command:

```bash
npx wrangler d1 execute knowledgebase-db --command="SELECT * FROM documents;" --json
```

### 4. Implement the Document Processing Workflow

In this step, we will introduce a [Cloudflare Workflow](https://developers.cloudflare.com/workflows/). This will allow us to define a durable workflow that can safely and robustly execute all the steps of the RAG process.

#### Update `wrangler.jsonc` with the Workflow Binding:

```jsonc
  "workflows": [
    {
      "name": "document-processing",
      "binding": "DOCUMENT_PROCESSING",
      "class_name": "DocumentProcessingWorkflow",
    },
  ],
```

> After editing `wrangler.jsonc`, run `npm run cf-typegen` to regenerate types.

In `src/index.ts`, add a new class called `DocumentProcessingWorkflow` that extends `WorkflowEntrypoint`:

```ts
import { WorkflowEntrypoint } from 'cloudflare:workers';

export class DocumentProcessingWorkflow extends WorkflowEntrypoint<Env, Params> {
  // ...
}
```

#### Creating the Workflow

First, install the required libraries:

```bash
npm i @langchain/textsplitters nanoid
```
Then implement the processing steps:

```ts
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { nanoid } from 'nanoid';

export class DocumentProcessingWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { content } = event.payload;
    console.log(content);
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
```

When a document is uploaded, the workflow:

- Splits the content into smaller text chunks using LangChain

- Inserts each chunk into your D1 database

- Generates an embedding (vector) for each chunk using Workers AI

- Stores the embedding in Cloudflare Vectorize for future search

#### Update Upload Endpoint to Trigger Workflow

Replace the logic in your `/api/documents` route to start the workflow instead of inserting directly into D1:

```ts
type Params = {
  content: string;
};

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
```
