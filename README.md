# Automated University Library Management System

Full-stack: React + Vite (frontend) · Flask REST API (backend) · MySQL (database).

## Status: Phase 7 complete (Testing)

- [x] Phase 1 — Planning
- [x] Phase 2 — Frontend scaffold (routing, auth context, protected routes, dashboard stubs)
- [x] Phase 3 — Backend auth + RBAC (JWT, register/login/me, role_required decorator)
- [x] Phase 4 — Full DB schema + models (books, categories, borrow_records, fines) + seed script
- [x] Phase 5 — REST APIs (books CRUD, borrow workflow, fines, dashboard stats)
- [x] Phase 6 — Frontend wired to real APIs (catalogue, borrow requests, fine management, reports chart)
- [x] Phase 7 — Testing (pytest suite: auth, books, borrow workflow, fines, dashboards — see docs/testing-strategy.md)
- [ ] Phase 8 — Deployment

> **Known issue found in Phase 7 testing:** public registration currently
> accepts an arbitrary `role`, allowing self-registration as admin. See
> `docs/testing-strategy.md` for the recommended fix — apply before
> deploying to production.

## Running Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest -v
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`. Login/register won't work yet — there's no
backend running behind `/api` until Phase 3. The routing, role-based
protected routes, and dashboard shells are fully wired and ready.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
```

Create the MySQL database first:

```sql
CREATE DATABASE university_library;
```

Then update `.env` with your local MySQL credentials, and run the migrations:

```bash
flask db init      # only the very first time
flask db migrate -m "initial schema"
flask db upgrade
```

Seed some demo data (5 categories, 5 books, 3 users — student/librarian/admin,
all with password `password123`):

```bash
flask shell
>>> from app.seed import run_seed
>>> run_seed()
>>> exit()
```

Then start the server:

```bash
python run.py
```

Full REST API is live at `http://localhost:5000/api` — auth, books CRUD,
borrow workflow (request/approve/reject/return with automatic fine
calculation), fines, and role-scoped dashboard stats.

### Database

The schema for all five core tables (`users`, `student_profiles`,
`categories`, `books`, `borrow_records`, `fines`) lives in
`docs/schema.sql`. You can run it directly against your MySQL database, or
wait for Phase 4 where it gets translated into SQLAlchemy models + Alembic
migrations so it's version-controlled properly.

## Folder Structure

```
university-library-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py       # app factory
│   │   ├── config.py
│   │   ├── extensions.py     # db, jwt, bcrypt, cors
│   │   ├── models/           # SQLAlchemy models (Phase 4)
│   │   ├── routes/           # Flask blueprints (Phase 3/5)
│   │   ├── services/         # business logic
│   │   ├── schemas/           # marshmallow validation
│   │   └── utils/             # decorators, error handlers
│   ├── migrations/
│   ├── tests/
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/        # Landing, Login, Register, Unauthorized
│   │   │   ├── student/
│   │   │   ├── librarian/
│   │   │   └── admin/
│   │   ├── context/           # AuthContext
│   │   ├── routes/            # ProtectedRoute
│   │   └── services/api/      # axios instance + per-resource calls
└── docs/
    └── schema.sql
```

## Next Phase

Phase 3 wires up Flask auth (`/api/auth/register`, `/api/auth/login`,
`/api/auth/me`) with JWT + role-based access control, matching the exact
contract the frontend's `AuthContext` already expects.
