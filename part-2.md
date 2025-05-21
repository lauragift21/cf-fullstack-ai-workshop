# 🔗 Part 2: Integrating Hono Framework

## ✅ Goals

- Add the Hono routing framework to simplify route handling
- Serve static files from a `public/` directory

## 🛠️ Instructions

### 1. **Install Hono**

```bash
npm install hono
```

### 2. **Update `src/index.ts`**

Replace your existing handler with this Hono app setup:

```ts
import { Hono } from 'hono';

const app = new Hono();

export default app;
```

### 3. **Update wrangler.jsonc**

Ensure your wrangler.jsonc includes the static assets section:

```json
"assets": {
  "directory": "./public",
  "binding": "ASSETS",
}
```

This tells Cloudflare Workers to bind your`./public` folder to the `ASSETS` binding. After adding a binding to `wrangler.jsonc` you can run `npm run cf-typegen` to generate types for your bindings.

### 4. **Run the app locally and test:**

```bash
npm run dev
```

### 5. **Visit `localhost:8787` and you should see your `index.html` page**
