# Scaffold Template: Node.js API (Express + TypeScript)

> Triggered by `/scaffold node-api --name <name>`

## Directory Structure

```
<name>/
├── src/
│   ├── index.ts         ← entry point
│   ├── app.ts           ← Express app setup
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   └── types/
├── tests/
├── .env.example
├── tsconfig.json
├── package.json
└── Dockerfile
```

## Conventions
- Strict TypeScript — no `any`
- Zod for all request validation at route level
- Services contain business logic; controllers are thin
- Errors extend a base `AppError` class
- JWT in HttpOnly cookies, not Authorization header
