# MemoryAssist AI - Backend Service ⚙️

Express.js microservice integrating **Hindsight Cloud memory** with **Groq LPU inference** for autonomous enterprise incident management.

## Architecture

- **Memory Engine:** Hindsight Client SDK (`@vectorize-io/hindsight-client`)
- **LLM Inference:** Groq SDK (`groq-sdk`) using `openai/gpt-oss-120b`
- **Fail-Safe Resilience:** In-memory fallback cache preventing downtime during network fluctuations or quota limits.

## API Endpoints

- `POST /chat` - Processes queries with dynamic Hindsight memory recall and async background retention.
- `GET /api/health` - Telemetry health check reporting Hindsight API version and feature flags.
- `GET /api/memories` - Fetches all indexed memories directly from the Hindsight Cloud bank.

## Running Locally

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start server
npm start
```
Server runs on `http://localhost:5000`.
