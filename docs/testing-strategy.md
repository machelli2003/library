# Testing Strategy — Phase 7

## Scope
Backend: unit + integration tests via pytest against an in-memory SQLite DB.
Frontend: manual QA checklist below (automated frontend tests recommended
as a future enhancement — see Phase 8 notes).

## Coverage by area

| Area | Test file | Covers |
|---|---|---|
| Auth | test_auth.py | register, duplicate email, validation, login (success/failure), /me, token requirement |
| Books | test_books.py | RBAC on create, duplicate ISBN, quantity/available_copies sync, delete |
| Borrow workflow | test_borrow.py | full request→approve→return cycle, no-copies-available, max active borrows, duplicate requests, fine calculation on late return, invalid state transitions |
| Fines | test_fines.py | marking paid, double-payment rejection, RBAC on viewing all fines |
| Dashboard | test_dashboard.py | response shape per role, cross-role access denial |

## Known issue found during testing

Public registration (`POST /api/auth/register`) currently accepts an
arbitrary `role`, so anyone hitting the API directly can register
themselves as `admin`. This is pinned down by
`test_KNOWN_ISSUE_anyone_can_self_register_as_admin` in `test_auth.py` so
it isn't silently reintroduced.

**Recommended fix:** restrict public registration to `student` only, and
add a separate admin-gated `POST /api/auth/create-staff` endpoint for
creating librarian/admin accounts. This should be resolved before Phase 8
deployment.

## Running the suite

```bash
cd backend
pip install -r requirements-dev.txt
pytest -v
```

## Manual UI checklist (frontend)

- [ ] Register as student → redirected to /login → login → lands on /student
- [ ] Student catalogue search filters correctly, pagination works
- [ ] Borrow request → librarian sees it under Borrow Requests → approve → status updates
- [ ] Return a book past due date → fine appears in both librarian and student fine views
- [ ] Attempting to visit /admin as a student redirects to /unauthorized
- [ ] Logout clears token and redirects to /login
