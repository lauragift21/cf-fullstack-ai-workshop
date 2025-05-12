# 🧠 Part 3: Add AI Capabilities

## ✅ Goals
- Integrate Workers AI and AI Gateway for LLM inference

## 🛠️ Instructions

1. **Call Workers AI built-in model:**
Use `@cf/meta/llama-2-7b-chat-int8` to run a basic text generation task.

2. **Set up AI Gateway:**
- Add your API key in `.dev.vars`
```env
AI_GATEWAY_API_KEY=your-api-key
```
- Update your handler to make a fetch request to AI Gateway endpoint (OpenAI/Anthropic)

3. **Test both routes and compare local model vs external model**

