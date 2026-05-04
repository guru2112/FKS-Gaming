# JKS Arena

Monorepo for the gaming cafe web app.

## Structure

- frontend: Next.js app
- backend: Express + MongoDB API

## Environment

Create a root .env with:

- PORT
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- CLIENT_ORIGIN

## Run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:3000 and the backend on http://localhost:5000.
