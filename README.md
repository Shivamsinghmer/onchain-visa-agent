# VisaAgent 🌍✈️

**Visas & eSIM Data — All in One Place.**

Chat with our AI to get your visa processed in minutes, then grab an eSIM data plan for your destination — no paperwork, no roaming fees.

🔗 **Live App:** [onchain-visa-agent.vercel.app](https://onchain-visa-agent.vercel.app)

---

## ✨ What is VisaAgent?

VisaAgent is an AI-powered travel companion that simplifies two of the most frustrating parts of international travel — **visa applications** and **mobile data connectivity**. Instead of navigating multiple government portals and telecom providers, you simply chat with our AI agent, which handles everything end-to-end.

- 🛂 **Visa Processing** — Submit and track visa applications through a conversational AI interface
- 📱 **eSIM Plans** — Browse and purchase eSIM data plans for your destination, instantly activated
- 💬 **AI Chat Interface** — No forms, no paperwork — just talk to the agent
- 🔐 **Secure Auth** — OTP-based authentication for safe, verified transactions
- 💳 **Payments** — Integrated payment flow to complete purchases in-chat

---

## 🏗️ Architecture

The project is a monorepo with three main packages:

```
onchain-visa-agent/
├── backend/          # Node.js/Express API server
├── frontend/         # React + Vite + Tailwind CSS web app
└── mcp-server/       # TypeScript MCP (Model Context Protocol) server
```

### Backend (`/backend`)

Express.js REST API that powers the agent's reasoning and session management.

| File | Description |
|---|---|
| `routes/agent.js` | Main agent route — handles chat messages and tool calls |
| `services/agentService.js` | Core agent logic and LLM orchestration |
| `services/mcpClient.js` | Client to communicate with the MCP server |
| `services/prompts.js` | System prompts and prompt templates |
| `services/sessionStore.js` | In-memory session and conversation history management |
| `server.js` | Express app entry point |

### Frontend (`/frontend`)

React SPA built with Vite and styled with Tailwind CSS.

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatHeader.jsx         # Top bar with session info
│   │   ├── ChatInput.jsx          # Message input with send controls
│   │   ├── ChatSidebar.jsx        # Conversation history sidebar
│   │   ├── MessageList.jsx        # Chat message thread
│   │   ├── OTPModal.jsx           # OTP verification dialog
│   │   ├── RightPanel.jsx         # Contextual info panel
│   │   ├── StructuredInputForm.jsx# Guided form inputs within chat
│   │   └── SuggestionGrid.jsx     # Quick-action suggestion chips
│   └── landing/
│       ├── CountryStrip.jsx       # Scrollable supported countries
│       ├── FeaturesSection.jsx    # Product feature highlights
│       ├── Footer.jsx
│       ├── Hero.jsx               # Hero section with CTA
│       └── Navbar.jsx
├── ApplicationCard.jsx            # Visa application status card
├── ChatInterface.jsx              # Main chat layout wrapper
├── EsimCard.jsx                   # eSIM plan display card
├── LandingPage.jsx                # Marketing landing page
├── MessageBubble.jsx              # Individual chat message bubble
├── OTPModal.jsx                   # OTP flow (root-level)
├── VisaCard.jsx                   # Visa details display card
├── hooks/
│   └── useChat.js                 # Chat state and API hook
└── App.jsx
```

### MCP Server (`/mcp-server`)

A TypeScript [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes structured tools to the AI agent, enabling it to take real-world actions.

```
src/
├── tools/
│   ├── applications.ts   # Visa application CRUD operations
│   ├── auth.ts           # OTP generation and verification
│   ├── esim.ts           # eSIM plan search and activation
│   ├── payments.ts       # Payment initiation and status
│   └── visas.ts          # Visa requirements and country lookup
└── wrapper/
    ├── mcpClient.ts      # MCP protocol client wrapper
    ├── queue.ts          # Request queue for tool calls
    ├── server.ts         # MCP server bootstrapper
    ├── index.ts          # Entry point
    └── utils.ts          # Shared utilities
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| AI Agent | MCP (Model Context Protocol) |
| MCP Server | TypeScript |
| Deployment | Vercel (frontend), Docker (MCP server) |
| Auth | OTP-based verification |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- Docker (for MCP server)

### 1. Clone the repository

```bash
git clone https://github.com/Shivamsinghmer/onchain-visa-agent.git
cd onchain-visa-agent
```

### 2. Set up the Backend

```bash
cd backend
cp .env.example .env
# Fill in your environment variables
npm install
npm start
```

### 3. Set up the MCP Server

```bash
cd mcp-server
cp .env.example .env
# Fill in your environment variables

# Run with Docker
docker build -t visa-mcp-server .
docker run -p 3001:3001 --env-file .env visa-mcp-server

# Or run locally
npm install
npm run dev
```

### 4. Set up the Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL to your backend URL
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
PORT=3000
MCP_SERVER_URL=http://localhost:3001
# Add your LLM API keys and other secrets
```

### MCP Server (`.env`)

```env
PORT=3001
# Add keys for visa APIs, eSIM provider APIs, payment gateway, etc.
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000
```

---

## 🤖 How It Works

1. **User sends a message** in the chat interface (e.g., *"I need a tourist visa for Japan"*)
2. **Backend agent** receives the message and calls the LLM with the appropriate system prompt
3. **LLM decides** which MCP tools to invoke (visa lookup, application creation, eSIM search, etc.)
4. **MCP Server** executes the tool and returns structured data
5. **Agent synthesizes** the result into a natural language response
6. **UI renders** the response alongside rich cards (VisaCard, EsimCard, ApplicationCard)
7. **User can complete actions** (like payment or OTP verification) without leaving the chat

---

## 📦 Deployment

### Frontend (Vercel)

The frontend is deployed automatically to [onchain-visa-agent.vercel.app](https://onchain-visa-agent.vercel.app) on every push to `main`.

### MCP Server (Docker)

```bash
cd mcp-server
docker build -t visa-mcp-server .
docker run -d -p 3001:3001 --env-file .env visa-mcp-server
```

---

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] More eSIM provider integrations
- [ ] Visa status push notifications
- [ ] Mobile app (React Native)
- [ ] Crypto / stablecoin payment support

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👤 Author

**Shivam Singh**
- GitHub: [@Shivamsinghmer](https://github.com/Shivamsinghmer)

---

## 📄 License

This project is open source. See the repository for license details.

---

<p align="center">Built with ❤️ to make international travel less painful.</p>
