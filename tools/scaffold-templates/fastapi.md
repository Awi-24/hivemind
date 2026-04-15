# Scaffold Template: FastAPI

> Triggered by `/scaffold fastapi --name <name>`

## Directory Structure

```
<name>/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/          ← SQLAlchemy models
│   ├── schemas/         ← Pydantic schemas
│   ├── routers/         ← API route handlers
│   ├── services/        ← business logic
│   ├── dependencies/    ← FastAPI dependencies (auth, db session)
│   └── middleware/
├── migrations/          ← Alembic migrations
│   └── alembic.ini
├── tests/
│   ├── conftest.py
│   └── test_*.py
├── .env.example
├── requirements.txt
├── pyproject.toml
└── Dockerfile
```

## Key Files

### `app/main.py`
```python
from fastapi import FastAPI
from app.routers import auth, users
from app.middleware.cors import setup_cors

app = FastAPI(title="<name>", version="0.1.0")
setup_cors(app)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

### `.env.example`
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Conventions
- Pydantic models for all input/output (schemas/)
- Business logic in services/ — routers are thin
- Use dependency injection for DB sessions and auth
- Alembic for all schema changes
- No raw SQL — use SQLAlchemy ORM or Core
