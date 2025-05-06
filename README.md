# 🚀 DevDocsBot – AI-Powered Doc Assistant with Cloudflare

This is the companion project for the **Full-Stack AI Development with Cloudflare** workshop. In this session, you'll build a Retrieval-Augmented Generation (RAG) app using Cloudflare Workers, Workers AI, AI Gateway, Vectorize, and D1.

---

## 📚 What You'll Learn

- How to create and deploy a Cloudflare Worker
- How to integrate Workers AI for local inference
- How to use AI Gateway to call external LLMs
- How to embed and store documents in Vectorize
- How to manage metadata with D1
- How to run semantic search and generate answers (RAG pattern)
- Bonus: Cloudflare Workflows, KV, Queues, and R2


## 🛠️ Prerequisites

- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Node.js (v18+) and npm installed
- Basic familiarity with JavaScript
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed:

```bash
npm install -g wrangler
````

## 🏗️ Project Setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/devdocsbot-workshop.git
cd devdocsbot-workshop
npm install
```

## 🚀 Running Locally

Start the dev server:

```bash
wrangler dev
```

Test your endpoints (e.g., `/generate`, `/search`, `/ask`).


## 🔐 Environment Variables

Create a `.dev.vars` file for local development:

```env
AI_GATEWAY_API_KEY=your-openai-or-anthropic-key
```


## 🧪 Key Endpoints

* `POST /generate` – Run LLM with prompt (Workers AI)
* `POST /search` – Query Vectorize index
* `POST /ask` – Full RAG response (Vector search + LLM)


## 📦 Deployment

Deploy to Cloudflare:

```bash
wrangler deploy
```


## 💡 Extra Credit

* Add Workers KV to cache responses
* Use R2 for file uploads and embedding
* Schedule re-embedding with Cloudflare Workflows
* Add a UI using Cloudflare Pages


## 🧭 Resources

* [Cloudflare AI Docs](https://developers.cloudflare.com/workers-ai/)
* [Vectorize](https://developers.cloudflare.com/vectorize/)
* [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
* [Cloudflare D1](https://developers.cloudflare.com/d1/)

