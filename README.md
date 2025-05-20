# 🧠 KnowledgeBase Assistant: Full-Stack AI App with Cloudflare

A hands-on workshop on building a Retrieval-Augmented Generation (RAG) application using Cloudflare Workers, Vectorize, D1, Workflows and Workers AI.

---

In this workshop, you’ll build a **KnowledgeBase Assistant** — a RAG-powered AI app that lets users upload content, ask questions about it, and receive context-aware answers grounded in their own documents.

In this hands-on project, you will:

- Create and deploy a Cloudflare Worker
- Add AI capabilities with Workers AI and AI Gateway
- Embed and search documents using Vectorize
- Store and retrieve metadata using D1
- Use Cloudflare Workflows to handle document processing and embedding
- Build a working Retrieval-Augmented Generation (RAG) app from scratch

---

## 🛠️ Prerequisites

- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Node.js (v18+) and npm installed
- Basic familiarity with JavaScript
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed:

```bash
npm install -g wrangler
```

---

## 🏗️ Project Setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/lauragift21/cf-fullstack-ai-workshop.git
cd cf-fullstack-ai-workshop
npm install
```

## 🚀 Running Locally

Start the dev server:

```bash
wrangler dev
```

## 📦 Deployment

Deploy to Cloudflare:

```bash
wrangler deploy
```

---

## 📦 Workshop Contents

- [🧱 Part 1: Cloudflare Workers Basics](./part-1.md)
- [🔗 Part 2: Integrating Hono Framework](./part-2.md)
- [🧠 Part 3: Add AI Capabilities](./part-3.md)
- [📄 Part 4: Uploading Documents & Automating with Workflows](./part-4.md)
- [💬 Part 5: Build the RAG Chat Endpoint](./part-5.md)
- [🚀 Part 6: Extra Enhancements](./part-6.md)

---

## 💡 Extra Credit

- Add Workers KV to cache responses
- Integrate external models (Anthropic/OpenAI)
- Deploy to a production domain

## 🧭 Resources

- [Cloudflare AI Docs](https://developers.cloudflare.com/workers-ai/)
- [Vectorize](https://developers.cloudflare.com/vectorize/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
