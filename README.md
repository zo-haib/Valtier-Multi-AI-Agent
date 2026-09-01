<div align="center">

![Valtier Banner](https://capsule-render.vercel.app/api?type=waving&color=0:2D3A2E,100:3D5A3E&height=200&section=header&text=Valtier&fontSize=70&fontColor=FAF8F5&animation=fadeIn&fontAlignY=38&desc=One%20unified%20system%20to%20build,%20test,%20ship%20%26%20orchestrate%20AI%20agents&descAlignY=58&descSize=18)

<img src="https://readme-typing-svg.demolab.com?font=Helvetica&weight=500&size=24&pause=1000&color=2D3A2E&center=true&vCenter=true&width=650&lines=Coordinate+your+AI+workforce.;Six+specialized+agents.+One+workspace.;Built+with+FastAPI+%2B+React+%2B+LangGraph." alt="Typing SVG" />

<br/>

![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-1C3C3C?style=for-the-badge)

![Stars](https://img.shields.io/badge/⭐_Star_this_repo-if_you_like_it-2D3A2E?style=for-the-badge)

</div>

<br/>

## ✨ What is Valtier?

**Valtier** is an AI workforce platform — a single workspace where six specialized AI agents (Project Management, Data Processing, Security, Analytics, Requirements, and Sales) coordinate automatically on complex, multi-step business tasks. Describe what you need in plain English; Valtier's **LangGraph orchestrator** classifies the request, routes it to the right agents, and stitches their output into one coherent result.

<div align="center">
<img src="https://readme-typing-svg.demolab.com?font=Helvetica&weight=400&size=16&pause=1500&color=3D5A3E&center=true&vCenter=true&width=700&lines=%22Analyze+our+sales+data%2C+identify+revenue+problems%2C+recommend+a+strategy...%22;%E2%86%92+Requirements+%2B+Project+Management+%2B+Analytics+agents+respond+as+one." alt="Typing SVG" />
</div>

<br/>

## 🚀 Features

<table>
<tr>
<td width="50%" valign="top">

### 🧠 Multi-Agent Orchestration
Every request is classified and routed to the right combination of specialist agents automatically — no manual agent picking.

### 🔐 Secure, Cookie-Based Auth
HttpOnly JWT access + refresh tokens, Argon2 password hashing, and session handling done right.

### 📊 Live Dashboard
Real, database-backed stats — tasks completed, active agents, knowledge sources, hours automated.

</td>
<td width="50%" valign="top">

### 💬 Conversational Workspace
Talk to Valtier like a teammate. It remembers context and shows exactly which agents handled which part of your request.

### 📚 Enterprise Knowledge Base
Upload documents and let agents ground their answers in your own data via ChromaDB + RAG.

### 💳 Built-in Billing
Stripe-powered subscriptions with plan tiers, checkout, and self-serve management.

</td>
</tr>
</table>

<br/>

## 📸 Product Tour

<div align="center">

### Landing Page
*A unified system to build, test, ship, and orchestrate AI agents.*

<img src="docs/screenshots/landing-page.jpeg" width="100%" alt="Valtier landing page"/>

<br/><br/>

### Create Your Workspace &nbsp;|&nbsp; Welcome Back
<table>
<tr>
<td width="50%"><img src="docs/screenshots/signup-page.jpeg" width="100%" alt="Signup page"/></td>
<td width="50%"><img src="docs/screenshots/login-page.jpeg" width="100%" alt="Login page"/></td>
</tr>
<tr>
<td align="center"><sub>Spin up an AI workforce in under a minute</sub></td>
<td align="center"><sub>Pick up right where you left off</sub></td>
</tr>
</table>

<br/>

### Dashboard Overview
*Real stats, quick actions, and active workflows — the moment you sign in.*

<img src="docs/screenshots/dashboard-overview.jpeg" width="100%" alt="Dashboard overview"/>

<br/><br/>

### Your AI Workforce
*Six specialized agents, each production-ready.*

<img src="docs/screenshots/agents-page.jpeg" width="100%" alt="Agents page"/>

<br/><br/>

### Agent Workspace &nbsp;|&nbsp; Conversations
<table>
<tr>
<td width="50%"><img src="docs/screenshots/workspace-page.jpeg" width="100%" alt="Agent workspace"/></td>
<td width="50%"><img src="docs/screenshots/conversations-page.jpeg" width="100%" alt="Conversations"/></td>
</tr>
<tr>
<td align="center"><sub>Coordinate your entire workforce on one complex task</sub></td>
<td align="center"><sub>Talk to Valtier — it routes to the right agents automatically</sub></td>
</tr>
</table>

</div>

<br/>

## 🏗️ Tech Stack

<div align="center">

| Frontend | Backend | AI / Data |
|:---:|:---:|:---:|
| React 19 + TypeScript | FastAPI | LangChain + LangGraph |
| React Router 7 | SQLAlchemy + PostgreSQL | Google Gemini |
| Tailwind CSS | Alembic migrations | ChromaDB (RAG) |
| Framer Motion | JWT (HttpOnly cookies) | Stripe billing |
| Vite | Argon2 password hashing | pandas / pypdf / python-docx |

</div>

<br/>

## ⚙️ Getting Started

<details>
<summary><b>1. Backend setup</b></summary>

```bash
cd valtier-backend
python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env    # fill in your DB URL, JWT secret, GOOGLE_API_KEY, Stripe keys

alembic upgrade head
uvicorn app.main:app --reload
```

</details>

<details>
<summary><b>2. Frontend setup</b></summary>

```bash
cd valtier-frontend
npm install
npm run dev
```

</details>

<details>
<summary><b>3. Open the app</b></summary>

Visit **http://localhost:5173** — sign up, and your AI workforce is ready.

</details>

<br/>

## 🗂️ Project Structure

```
valtier-frontend/
├── src/
│   ├── pages/            # Dashboard, Workspace, Conversations, Agents, Settings…
│   ├── components/       # marketing/, layout/, agents/, ui/
│   ├── services/         # typed API clients (auth, agents, conversations…)
│   └── data/              # static agent metadata
└── docs/screenshots/      # you're looking at them ☝️

valtier-backend/
├── app/
│   ├── api/               # auth, dashboard, agents, conversations, admin…
│   ├── core/               # config, security, database
│   ├── services/           # business logic + LangGraph orchestration
│   └── models/             # SQLAlchemy models
└── alembic/                # database migrations
```

<br/>

<div align="center">

![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:2D3A2E,100:3D5A3E&height=120&section=footer)

**Built by [Muhammad Zohaib](https://github.com/) — PUCIT**

</div>
