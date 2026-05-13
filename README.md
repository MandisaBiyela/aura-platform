# AURA Platform

> AI-powered device management, ticketing, and predictive maintenance platform.

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-teal?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Overview

AURA is a full-stack platform for managing devices, support tickets, and maintenance workflows — with a growing AI layer for automated ticket classification, predictive maintenance, and computer vision-based device scanning.

Built as a portfolio project demonstrating end-to-end software engineering: REST APIs, React dashboards, ML integration, MLOps, and cloud deployment.

---

## Architecture

```
React Frontend (Vite + TailwindCSS)
        ↓
FastAPI Gateway  (JWT auth · routing · validation)
        ↓
┌─────────────────────────────────────────┐
│  Auth Service       Device Service      │
│  Ticket Service     AI Classifier       │
│  Predictive ML      Computer Vision     │
└─────────────────────────────────────────┘
        ↓
PostgreSQL Database
        ↓
Cloud Storage / Logs
```

---
<img width="626" height="563" alt="Screenshot 2026-05-13 174924" src="https://github.com/user-attachments/assets/0557205d-86f1-4c48-92f9-9d38d26d6e2e" />

## Project Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | 🔧 In progress | Auth, dashboard, inventory, ticketing |
| Phase 2 | 🔜 Planned | AI ticket classifier (NLP) |
| Phase 3 | 🔜 Planned | Predictive maintenance ML model |
| Phase 4 | 🔜 Planned | Computer vision device scanner |
| Phase 5 | 🔜 Planned | Docker, CI/CD, cloud deployment |

---

## Repositories

| Repo | Description |
|------|-------------|
| [`aura-platform`](https://github.com/YOUR_USERNAME/aura-platform) | This repo — main platform |
| [`aura-ticket-ai`](https://github.com/YOUR_USERNAME/aura-ticket-ai) | NLP ticket classifier |
| [`aura-predictive-maintenance`](https://github.com/YOUR_USERNAME/aura-predictive-maintenance) | ML prediction engine |
| [`aura-vision-ai`](https://github.com/YOUR_USERNAME/aura-vision-ai) | Computer vision scanner |
| [`aura-infra`](https://github.com/YOUR_USERNAME/aura-infra) | Docker + deployment configs |

---

## Tech Stack

### Backend
- **FastAPI** — REST API framework
- **SQLAlchemy** — ORM
- **Alembic** — database migrations
- **PostgreSQL** — primary database
- **python-jose** — JWT authentication
- **Pydantic** — data validation

### Frontend
- **React 18** + **Vite**
- **TailwindCSS**
- **Axios** — API client
- **React Router**

### AI/ML (coming in Phases 2–4)
- **scikit-learn** / **PyTorch**
- **Hugging Face Transformers**
- **OpenCV**

### DevOps (Phase 5)
- **Docker** + **Docker Compose**
- **GitHub Actions** — CI/CD
- **Render / Railway / AWS** — cloud deployment

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

### 1. Clone the repo

```bash
git clone https://github.com/MandisaBiyela/aura-platform.git
cd aura-platform
```

**Git hooks (once per clone):** keeps GitHub contributors aligned with human authors only by removing Cursor co-author trailers from commit messages.

```bash
git config core.hooksPath .githooks
```

In **Cursor**, you can also turn off **Agents → Attribution → Commit attribution** (or set `commitAttribution` to `false` in the Cursor CLI config) so co-author lines are not injected in the first place. See [Cursor forum: co-author discussion](https://forum.cursor.com/t/co-author-added-without-consent-and-cant-be-turned-off/150096).

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@localhost:5432/aura_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Run database migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

API will be live at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be live at `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Login and receive JWT token |
| GET | `/auth/me` | Get current authenticated user |

### Devices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/devices` | List all devices |
| POST | `/devices` | Add a new device |
| GET | `/devices/{id}` | Get device by ID |
| PUT | `/devices/{id}` | Update device |
| DELETE | `/devices/{id}` | Delete device |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tickets` | List all tickets |
| POST | `/tickets` | Create a ticket |
| GET | `/tickets/{id}` | Get ticket by ID |
| PATCH | `/tickets/{id}/status` | Update ticket status |

---

## Project Structure

```
aura-platform/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── auth/             # JWT authentication
│   │   ├── devices/          # Device inventory service
│   │   ├── tickets/          # Ticket management service
│   │   ├── models/           # SQLAlchemy models
│   │   └── database.py       # DB connection
│   ├── alembic/              # Database migrations
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/            # Dashboard, Inventory, Tickets
│   │   ├── components/       # Reusable UI components
│   │   └── api/              # Axios service layer
│   └── package.json
├── architecture/             # Diagrams and docs
├── .github/
│   └── workflows/            # CI/CD pipelines (Phase 5)
└── README.md
```

---

## Development Workflow

```bash
# Always branch off dev
git checkout dev
git checkout -b feature/your-feature-name

# Work, commit often
git add .
git commit -m "feat: describe what you built"

# Push and open a pull request into dev
git push origin feature/your-feature-name
```

Commit message convention:

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation update |
| `refactor:` | Code restructure, no behaviour change |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, config, dependencies |

---

## Roadmap

- [x] Project structure and GitHub setup
- [ ] Auth service (register, login, JWT)
- [ ] Device inventory CRUD
- [ ] Ticket management system
- [ ] React dashboard
- [ ] AI ticket classifier (Phase 2)
- [ ] Predictive maintenance model (Phase 3)
- [ ] Computer vision scanner (Phase 4)
- [ ] Docker + CI/CD + cloud deployment (Phase 5)

---

## Author

**Mandisa** — [GitHub](https://github.com/MandisaBiyela) · [LinkedIn](https://www.linkedin.com/in/nokuphila-mandisa-biyela-4573b0293/)

---

## License

MIT — see [LICENSE](LICENSE) for details.
