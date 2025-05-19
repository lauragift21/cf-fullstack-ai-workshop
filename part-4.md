# 📄 Part 4: Uploading Documents & Automating with Workflows

## ✅ Goals

- Accept document uploads from users
- Store metadata and content in D1
- Generate and store embeddings using Vectorize
- Use Cloudflare Workflows to handle or schedule processing (optional enhancement)

## 🛠️ Instructions

### 1. **Create a new D1 and Vectorize database**

```bash
npx wrangler d1 create knowledgebase-db
npx wrangler vectorize create knowledgebase-vectors --dimensions=768 --metric=cosine
```

Then add the following in your `wrangler.jsonc` file:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "knowledgebase-db",
      "database_id": "your-d1-id"
    }
  ],
  "vectorize": [
    {
      "binding": "VECTORIZE",
      "index_name": "knowledgebase-vectors"
    }
  ]
}
```

### 2. ** Create D1 Schema (schema.sql)**

```sql
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS conversations;

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  document_ids TEXT,
  created_at INTEGER NOT NULL
);
```

Then run:

```bash
npx wrangler d1 execute knowledgebase-db --file=./schema.sql
```

### 3. **Set up Cloudflare Workflow (Optional)**

> We will use Workflows to decouple document processing (e.g., chunking + embedding) from the upload request.

### 4. **Update `/api/documents` to call the Workflow**

### 5. **Workflow Script to Process & Embed Document**
