# Merkatara - Online Marketplace Platform

Merkatara is a production-grade, zero-configuration Online Marketplace integrating a React Vite Web SPA, an Expo React Native Mobile App, and a Node.js Express REST API backend with MongoDB, JWT Authentication (RBAC), and LogRocket monitoring.

---

## ⚡ Zero-Configuration Guarantee

This project boots out-of-the-box with **zero manual configuration**. You do not need to manually configure `.env` files. Safe fallback defaults and automatic database seeding (`autoSeedIfEmpty()`) ensure instant evaluation.

### Option A: Run via Docker Compose (Recommended)
Spins up MongoDB v9.0, Backend Node.js v26, and Frontend Nginx in isolated containers:
```bash
docker compose up -d --build
```
- **Frontend Web:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Option B: Local Workstation Development

1. **Install dependencies:**
```bash
npm run install:all
```

2. **Start Backend & Frontend concurrently:**
```bash
npm run dev
# Backend runs on http://localhost:5000
# Frontend runs on http://localhost:3000 (proxies /api to 5000)
```

3. **Start Mobile App (Expo):**
```bash
cd mobile
npx expo start
# Scan the generated QR code in your terminal using Expo Go
```

---

## 🔑 Demo Credentials (Auto-Seeded)

The backend automatically seeds an admin and a demo customer account on first run:

| Role | Email | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin@market.com` | `admin123` | Product creation, updates, deletion, user management |
| **Customer** | `user@market.com` | `user123` | Browsing, cart management, checkout access |

---

## 🛠️ Tech Stack & Rust Linter

- **Backend:** Node.js v26 LTS, Express, TypeScript, Mongoose (MongoDB v9.0), Zod, bcryptjs, jsonwebtoken.
- **Frontend:** React 18, Vite, TypeScript, React Router v6, Axios, LogRocket, Responsive CSS Grid / Flexbox.
- **Mobile:** React Native, Expo SDK 52, TypeScript, React Navigation Stack, Expo SecureStore.
- **Linter:** `oxlint` (Blazing fast Rust linter):
  ```bash
  npm run lint
  ```

---

## 🚀 Cloud Deployment Guides

### 1. Frontend Web (Vercel / Netlify)
- **Vercel:** Root directory `frontend/`, Framework Preset `Vite`. Build command: `npm run build`, Output directory: `dist`. SPA rewrites handled by `frontend/vercel.json`.
- **Netlify:** Base directory `frontend/`, Build command `npm run build`, Publish directory `frontend/dist`. Redirect rules handled by `frontend/netlify.toml`.
- Set Environment Variable: `VITE_API_URL=https://<your-backend-domain>/api`

### 2. Backend API (Render / Heroku)
- **Render:** Deploy directly using the root blueprint `render.yaml` or create a Web Service pointing to `backend/`.
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run start`
  - Environment Variables: `MONGO_URI=<your-mongodb-atlas-url>`, `JWT_SECRET=<secret>`
- **Heroku:** Buildpack `heroku/nodejs`. Heroku automatically reads `backend/Procfile` (`web: npm run start`).

### 3. Mobile App (Expo QR Code)
- Build or publish via Expo EAS CLI:
  ```bash
  cd mobile
  npx eas-cli build -p android --profile preview
  ```
- Or run `npx expo start` to instantly share the live Expo QR code with team evaluators.

---

## 📚 API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT |
| `GET` | `/api/auth/me` | Protected | Current authenticated user profile |
| `GET` | `/api/products` | Public | List products (supports `?category=` & `?search=`) |
| `GET` | `/api/products/:id` | Public | Get single product details |
| `POST` | `/api/products` | Admin | Create product (Zod validated) |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `GET` | `/api/users` | Admin | List all registered users |
| `GET` | `/api/health` | Public | Uptime and server status check |
