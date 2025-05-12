# 🔗 Part 2: Integrating Hono Framework

## ✅ Goals
- Add the Hono routing framework to simplify route handling

## 🛠️ Instructions

1. **Install Hono:**
```bash
npm install hono
```

2. **Update your `index.ts`:**
Replace your default handler with a Hono app and define a few sample routes.

```ts
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello from Hono!'));

export default app;
```

3. **Run the app locally and test:**
```bash
wrangler dev
```

4. **Visit `localhost:8787` to test your Hono route**
