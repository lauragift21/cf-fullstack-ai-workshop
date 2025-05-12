# 🔍 Part 4: Build a RAG Pipeline

## ✅ Goals
- Store and search document embeddings using Vectorize
- Use D1 to store and retrieve metadata

## 🛠️ Instructions

1. **Prepare documents in `docs/` folder**
2. **Embed text using Workers AI or OpenAI and store in Vectorize**
3. **Create a D1 database and table to store titles, source links, etc.**
4. **Create a `/ask` endpoint:**
- Search Vectorize
- Fetch matching metadata from D1
- Combine and send prompt to LLM

