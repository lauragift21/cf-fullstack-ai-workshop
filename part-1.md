# ✨ Part 1: Cloudflare Workers Basics

## ✅ Goals

- Set up your first Cloudflare Worker
- Understand the Wrangler CLI
- Run your app locally and deploy it to Cloudflare

## 🛠️ Instructions

### 1. **Clone the workshop project**

> Instead of starting from scratch, we'll use the pre-configured workshop repository:

```bash
git clone https://github.com/lauragift21/cf-fullstack-ai-workshop.git
cd cf-fullstack-ai-workshop
```

### 2. **Install dependencies:**

```bash
npm install
```

### 3. **Run the app locally:**

```bash
npx wrangler dev
```

> This runs your Worker in a local dev environment and watches for changes.

### 4. **Deploy your app:**

```bash
npx wrangler deploy
```

### 5. **Explore the project structure and `wrangler.jsonc` config**

- Review `wrangler.jsonc` to see how environment bindings (like AI, D1, Vectorize) are configured

- Check the `public/` folder for frontend assets (HTML, CSS, JS)
