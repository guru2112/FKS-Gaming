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
- MAIL_USERNAME
- MAIL_PASSWORD
- MAIL_FROM (optional, defaults to MAIL_USERNAME)
- SMTP_HOST (optional, defaults to Gmail)
- SMTP_PORT (optional, defaults to 587)
- SMTP_SECURE (optional, true for port 465)
- QR_TOKEN_SECRET (optional, defaults to JWT_SECRET)

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
