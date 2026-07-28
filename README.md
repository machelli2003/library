# University Library Management System

Full-stack: **React + Vite** (frontend) · **Flask REST API** (backend) · **MongoDB Atlas** (database).

## Status: Phase 8 — Deployment (Render)

- [x] Phase 1 — Planning
- [x] Phase 2 — Frontend scaffold (routing, auth context, protected routes, dashboard stubs)
- [x] Phase 3 — Backend auth + RBAC (JWT, register/login/me, role_required decorator)
- [x] Phase 4 — MongoDB models (books, categories, borrow_records, fines) + seed script
- [x] Phase 5 — REST APIs (books CRUD, borrow workflow, fines, dashboard stats)
- [x] Phase 6 — Frontend wired to real APIs (catalogue, borrow requests, fine management, reports chart)
- [x] Phase 7 — Testing (pytest suite: 33 tests, all passing with mongomock)
- [x] Phase 8 — Deployment on Render (render.yaml blueprint)

---

## Deployment (Render)

This project uses a **render.yaml** Blueprint at the root to define both services.

### Quick Deploy

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect your GitHub repo → Render will detect `render.yaml` automatically
4. Set these **manual environment variables** in each service dashboard:

**Backend (`library-backend`)**:
| Variable | Value |
|---|---|
| `MONGO_URI` | `mongodb+srv://library_user:<pass>@cluster0.o35blay.mongodb.net/university_library?retryWrites=true&w=majority` |
| `CORS_ORIGINS` | `https://library-frontend.onrender.com` |

**Frontend (`library-frontend`)**:
| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://library-backend.onrender.com/api` |

> **Important:** In MongoDB Atlas → Network Access → add `0.0.0.0/0` to allow Render's dynamic IPs.

### Seed the Database

After the backend is deployed, open the Render **Shell** tab and run:

```bash
python seed_mongo.py
```

This creates 5 categories, 5 books, and 3 default users (student/librarian/admin with password `password123`).

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
pip install -r requirements-dev.txt
cp .env.example .env         # fill in MONGO_URI
python run.py
```

API available at `http://localhost:5000/api`.

### Frontend

```bash
cd frontend
npm install
# Create .env with:  VITE_API_URL=http://localhost:5000/api
npm run dev
```

Visit `http://localhost:5173`.

### Tests

```bash
cd backend
python -m pytest -v
# 33 tests, all passing
```

---

## Folder Structure

```
university-library-system/
├── render.yaml               # Render Blueprint (both services)
├── backend/
│   ├── Procfile              # gunicorn start command
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── run.py
│   ├── seed_mongo.py         # MongoDB seed script
│   ├── create_db.py          # Ensures indexes on Atlas
│   ├── clear_data.py         # Drops all collections
│   └── app/
│       ├── __init__.py       # App factory + blueprints
│       ├── config.py
│       ├── extensions.py     # MongoEngine, JWT, bcrypt, CORS, SocketIO
│       ├── models/           # MongoEngine documents
│       ├── routes/           # Flask blueprints
│       ├── services/         # Business logic
│       ├── schemas/          # Marshmallow validation
│       └── utils/            # Decorators
└── frontend/
    ├── public/
    │   └── _redirects        # SPA fallback for Render
    ├── vite.config.js
    └── src/
        ├── pages/
        │   ├── public/       # Landing, Login, Register
        │   ├── student/
        │   ├── librarian/
        │   └── admin/
        ├── context/          # AuthContext
        ├── routes/           # ProtectedRoute
        └── services/api/     # Axios instance + per-resource API calls
```
