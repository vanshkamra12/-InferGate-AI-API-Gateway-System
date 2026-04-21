# InferGate — AI API Gateway System

A **production-grade, containerized AI API Gateway** built with microservices architecture, reverse proxy, distributed request tracing, and intelligent usage metering.

This project demonstrates how modern AI startups architect their backend infrastructure for scalability, observability, and security.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white)](https://nginx.org/)

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
- [Why This Project?](#-why-this-project)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Observability](#-observability)
- [Production Concepts](#-production-concepts-demonstrated)
- [Roadmap](#-roadmap)
- [Project Structure](#-project-structure)
- [Design Philosophy](#-design-philosophy)

---

## 🏗 Architecture Overview

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    NGINX    │  ← Reverse Proxy
                    │   Port 80   │     (Single Entry Point)
                    └──────┬──────┘
                           │
                    ┌──────▼──────────┐
                    │  API Gateway    │  ← Request Orchestration
                    │   Port 4000     │     Authentication
                    │                 │     Rate Limiting
                    └─────┬───┬───┬───┘     Usage Enforcement
                          │   │   │
          ┌───────────────┘   │   └─────────────┐
          │                   │                 │
    ┌─────▼─────┐      ┌──────▼──────┐   ┌─────▼─────┐
    │   Auth    │      │   Usage     │   │    AI     │
    │  Service  │      │   Service   │   │  Service  │
    │ Port 4001 │      │  Port 4002  │   │ Port 4003 │
    └─────┬─────┘      └──────┬──────┘   └─────┬─────┘
          │                   │                 │
    ┌─────▼─────┐      ┌──────▼──────┐   ┌─────▼─────┐
    │  MongoDB  │      │   MongoDB   │   │  Ollama   │
    │ (auth-db) │      │ (usage-db)  │   │  (LLM)    │
    └───────────┘      └──────┬──────┘   └───────────┘
                              │
                       ┌──────▼──────┐
                       │    Redis    │  ← Rate Limiting Cache
                       │  Port 6379  │
                       └─────────────┘
```

### Service Responsibilities

| Service | Port | Responsibility |
|---------|------|----------------|
| **NGINX** | 80 | Reverse proxy, single public endpoint |
| **API Gateway** | 4000 | Request routing, auth validation, rate limiting |
| **Auth Service** | 4001 | API key generation & validation |
| **Usage Service** | 4002 | Token consumption tracking, quota enforcement |
| **AI Service** | 4003 | LLM integration via Ollama |
| **MongoDB** | 27017 | Persistent storage (auth & usage data) |
| **Redis** | 6379 | In-memory cache for rate limiting |

---

## 🔥 Key Features

### ✅ Reverse Proxy Architecture
- **Single public entry point** via Nginx
- Internal services hidden from external access
- Clean production-ready routing patterns
- Load balancing ready

### ✅ API Gateway Pattern
- **Central request orchestration**
- Authentication delegation to auth service
- Usage metering enforcement before AI calls
- Intelligent error handling and circuit breaking
- Request/response transformation

### ✅ Microservices Architecture
- **Auth Service**: API key lifecycle management
- **Usage Service**: Token consumption tracking with MongoDB persistence
- **AI Service**: LLM integration with local Ollama runtime
- Fully containerized with Docker Compose
- Service isolation and independent scaling

### ✅ Redis-Based Rate Limiting
- **Sliding window algorithm** for precise rate control
- Per-user request throttling
- Distributed rate limiting across instances
- Protection against abuse and DDoS

### ✅ MongoDB Persistence
- Separate databases per service (auth-db, usage-db)
- Persistent Docker volumes for data durability
- Atomic operations for token consumption
- Monthly quota reset logic

### ✅ Distributed Request Tracing
- **Correlation ID (`x-request-id`)** generated at gateway
- Propagated across all microservices
- Cross-container debugging capability
- Production-ready observability foundation

### ✅ Usage-Based Metering
- Token consumption tracking per request
- Monthly quota enforcement (5000 tokens for FREE plan)
- Atomic deduction to prevent race conditions
- Request logging with response time metrics

### ✅ One-Command Deployment
```bash
docker compose up --build
```
- All services orchestrated
- Internal Docker networking configured
- Volumes automatically mounted
- Environment variables injected

---

## 🧠 Why This Project?

This project demonstrates **real-world backend engineering concepts** used by AI SaaS companies:

| Concept | Implementation | Why It Matters |
|---------|----------------|----------------|
| **Reverse Proxy** | Nginx front-end | Industry standard for API gateways |
| **Service Mesh** | Internal Docker network | Microservices communication pattern |
| **Distributed Tracing** | Request correlation IDs | Debugging across multiple services |
| **Usage Metering** | Token tracking system | Billing infrastructure foundation |
| **Rate Limiting** | Redis sliding window | Protection against abuse |
| **Authentication** | API key validation | Secure access control |
| **Containerization** | Docker Compose | Production deployment readiness |

**This is not a tutorial project** — it's a portfolio-grade system that mirrors how companies like OpenAI, Anthropic, or Cohere architect their API infrastructure.

---

## 🛠 Tech Stack

### Backend
- **Node.js** (v20+) - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer

### Data Layer
- **MongoDB** (v6) - Persistent storage
- **Redis** (v7) - In-memory cache for rate limiting

### AI
- **Ollama** - Local LLM runtime
- **LLaMA 3** - Language model (8B parameters)

### Observability
- **Distributed Tracing** - Request correlation IDs
- **Structured Logging** - Cross-service log propagation

---

## ⚙️ Quick Start

### Prerequisites
- **Docker Desktop** installed and running
- **Ollama** installed locally ([Download](https://ollama.ai))
- **Git** for cloning the repository

### Installation

1️⃣ **Clone the repository**
```bash
git clone https://github.com/vanshkamra12/-InferGate-AI-API-Gateway-System.git
cd Ai-Gateway-System
```

2️⃣ **Pull the LLaMA 3 model** (one-time setup)
```bash
ollama pull llama3
```

3️⃣ **Start all services**
```bash
docker compose up --build
```

4️⃣ **Verify system health**
```bash
curl http://localhost/health
```

Expected response:
```json
{
  "message": "API Gateway Running"
}
```

---

## 📡 API Documentation

### Base URL
```
http://localhost
```

### Endpoints

#### 1. Register User
Create a new user and receive an API key.

**Request:**
```http
POST /v1/register
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "apiKey": "sk_1234567890abcdef",
  "plan": "FREE"
}
```

---

#### 2. Generate AI Response
Send a prompt to the AI service and receive a generated response.

**Request:**
```http
POST /v1/chat
Content-Type: application/json
x-api-key: sk_1234567890abcdef

{
  "prompt": "Explain quantum computing in simple terms"
}
```

**Response:**
```json
{
  "output": "Quantum computing uses quantum mechanics principles...",
  "tokensUsed": 127
}
```

**Error Responses:**

*Quota Exceeded:*
```json
{
  "message": "Token quota exceeded"
}
```

*Invalid API Key:*
```json
{
  "message": "Invalid API key"
}
```

---

#### 3. Get Usage Statistics
Retrieve current token usage and remaining quota.

**Request:**
```http
GET /v1/usage
x-api-key: sk_1234567890abcdef
```

**Response:**
```json
{
  "usedTokens": 1250,
  "monthlyLimit": 5000,
  "remainingTokens": 3750,
  "percentageUsed": 25.00
}
```

---

## 📊 Observability

### Distributed Request Tracing

Every request generates a unique **correlation ID** that flows through all services:

```
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] Gateway: Chat request from user: 507f1f77bcf86cd799439011
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] Gateway: Validating API key
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] Auth: Verifying API key
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] Auth: API key verified for user: 507f1f77bcf86cd799439011
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] Gateway: Calling AI service
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] AI: Generating AI response for prompt: "Explain quantum computing..."
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] AI: AI response generated in 1250ms, tokens: 127
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] Gateway: Calling usage service to consume tokens
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] Usage: Consuming 127 tokens for user: 507f1f77bcf86cd799439011
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] Usage: Tokens consumed successfully. Used: 1127/5000
[b7ab8f1e-efe1-4725-9194-29b10b08ba8c] Gateway: Request completed successfully in 1280ms
```

### Benefits:
- **Cross-service debugging** - Track a single request across all containers
- **Performance analysis** - Identify bottlenecks in the request flow
- **Error correlation** - Link failures across distributed services
- **Production readiness** - Foundation for APM tools (Datadog, New Relic)

---

## 🧩 Production Concepts Demonstrated

| Concept | Implementation | Real-World Usage |
|---------|----------------|------------------|
| **Reverse Proxy** | Nginx routing layer | AWS ALB, Cloudflare, Nginx Plus |
| **Service Discovery** | Docker internal DNS | Kubernetes Services, Consul |
| **API Gateway Pattern** | Centralized routing & auth | Kong, AWS API Gateway, Apigee |
| **Circuit Breaker** | Timeout handling | Netflix Hystrix pattern |
| **Rate Limiting** | Redis sliding window | Cloudflare, Rate.io |
| **Usage Metering** | Token consumption tracking | Stripe Billing, AWS Cost Explorer |
| **Distributed Tracing** | Request correlation IDs | Jaeger, Zipkin, OpenTelemetry |
| **Container Orchestration** | Docker Compose | Kubernetes, Docker Swarm |
| **Persistent Volumes** | MongoDB data retention | EBS volumes, Persistent Volumes |
| **Service Isolation** | Separate databases per service | Database-per-service pattern |

---

## 🚀 Roadmap

### 🔜 Phase 1: Enhanced Observability
- [ ] Structured JSON logging with Pino
- [ ] Log level standardization (DEBUG, INFO, WARN, ERROR)
- [ ] Integration with ELK stack (Elasticsearch, Logstash, Kibana)
- [ ] Prometheus metrics export
- [ ] Grafana dashboards

### 🔜 Phase 2: Security Hardening
- [ ] JWT-based authentication (replace API keys)
- [ ] Refresh token rotation flow
- [ ] Role-based access control (RBAC)
- [ ] API key encryption at rest
- [ ] HTTPS/TLS termination at Nginx

### 🔜 Phase 3: Advanced Rate Limiting
- [ ] Per-plan throttling policies (FREE: 10 req/min, PRO: 100 req/min)
- [ ] Token bucket algorithm option
- [ ] Dynamic rate limit adjustment
- [ ] Rate limit headers in responses

### 🔜 Phase 4: Billing System
- [ ] Stripe integration simulation
- [ ] Plan upgrades/downgrades
- [ ] Usage-based pricing tiers
- [ ] Invoice generation
- [ ] Payment webhook handling

### 🔜 Phase 5: AI Improvements
- [ ] Streaming responses (Server-Sent Events)
- [ ] Multi-model routing (GPT-4, Claude, LLaMA)
- [ ] Token usage pre-estimation
- [ ] Response caching for identical prompts
- [ ] Prompt template library

### 🔜 Phase 6: DevOps & Scalability
- [ ] Kubernetes deployment manifests
- [ ] Horizontal pod autoscaling (HPA)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Multi-stage Docker builds for production
- [ ] Health check endpoints (`/healthz`, `/readyz`)
- [ ] Blue-green deployment strategy

### 🔜 Phase 7: Advanced Features
- [ ] WebSocket support for real-time chat
- [ ] Multi-tenancy with workspace isolation
- [ ] Admin dashboard for usage analytics
- [ ] Webhook notifications for quota alerts
- [ ] API versioning strategy

---

## 📁 Project Structure

```
Ai-Gateway-System/
│
├── api-gateway/                 # Central routing & orchestration
│   ├── src/
│   │   ├── config/
│   │   │   └── redis.ts        # Redis connection
│   │   ├── controllers/
│   │   │   ├── chatController.ts
│   │   │   ├── registerController.ts
│   │   │   ├── usageController.ts
│   │   │   └── testController.ts
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.ts      # API key validation
│   │   │   ├── rateLimiter.ts         # Redis-based rate limiting
│   │   │   ├── requestId.ts           # Request correlation ID
│   │   │   └── logger.ts              # Request/response logging
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── auth-service/                # API key management
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts           # MongoDB connection
│   │   ├── controllers/
│   │   │   └── authController.ts
│   │   ├── models/
│   │   │   └── User.ts         # User schema
│   │   ├── routes/
│   │   │   └── authRoutes.ts
│   │   ├── utils/
│   │   │   └── generateApiKey.ts
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── usage-service/               # Token consumption tracking
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   ├── controllers/
│   │   │   └── usageController.ts
│   │   ├── models/
│   │   │   ├── Usage.ts        # Quota tracking
│   │   │   └── RequestLog.ts   # Request history
│   │   ├── routes/
│   │   │   └── usageRoutes.ts
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/                  # LLM integration
│   ├── src/
│   │   ├── controllers/
│   │   │   └── aiController.ts
│   │   ├── routes/
│   │   │   └── aiRoutes.ts
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── nginx/                       # Reverse proxy
│   ├── Dockerfile
│   └── nginx.conf              # Routing configuration
│
├── docker-compose.yml          # Multi-container orchestration
├── .gitignore
└── README.md
```

---

## 🧠 Design Philosophy

### 1. **Production-First Mindset**
This system is architected with production deployment in mind:
- Service isolation for independent scaling
- Persistent storage with Docker volumes
- Request tracing for debugging
- Rate limiting for abuse protection
- Health check endpoints

### 2. **Microservices Best Practices**
- **Single Responsibility**: Each service has one clear purpose
- **Database per Service**: Auth and Usage have separate MongoDB databases
- **API Gateway Pattern**: Centralized routing and cross-cutting concerns
- **Service Discovery**: Docker internal DNS for service-to-service communication

### 3. **Observability Foundation**
- Correlation IDs propagate through the entire request lifecycle
- Structured logging with request context
- Performance metrics (response times, token counts)
- Ready for APM tool integration

### 4. **Real-World Patterns**
This project mirrors patterns used by:
- **OpenAI** (API gateway, usage metering, rate limiting)
- **Stripe** (API key authentication, usage-based billing)
- **Uber** (microservices architecture, distributed tracing)
- **Netflix** (service isolation, circuit breakers)

### 5. **Scalability Considerations**
- Stateless services (can be horizontally scaled)
- Redis for distributed state (rate limiting)
- MongoDB for persistent data
- Reverse proxy for load distribution

---

## 📌 What Makes This Different

Unlike typical tutorial projects, InferGate includes:

| Feature | Typical Tutorial | InferGate |
|---------|-----------------|-----------|
| Architecture | Monolithic | Microservices with gateway |
| Deployment | Local only | Production-ready containers |
| Observability | `console.log` | Distributed tracing with correlation IDs |
| Authentication | Hardcoded keys | Dynamic API key generation & validation |
| Rate Limiting | None | Redis-based sliding window |
| Usage Tracking | None | Per-user token consumption & quotas |
| Reverse Proxy | Direct access | Nginx front-end |
| AI Integration | Mock responses | Real LLM via Ollama |
| Data Persistence | In-memory | MongoDB with persistent volumes |
| Error Handling | Basic try-catch | Service-specific error propagation |

This system demonstrates **architectural maturity** and **production readiness** — key differentiators in senior engineering portfolios.

---

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

