# JobTracker

A full-stack job application tracker built with React + MUI, Node.js + Express, PostgreSQL (AWS RDS), and Prisma.

---

## Project Structure

```
job-tracker/
├── client/          # React frontend (Vite)
└── server/          # Express backend
    └── prisma/      # Prisma schema, migrations, seed
```

---

## Prerequisites

- Node.js 18+
- npm 9+
- A PostgreSQL database (AWS RDS or local)

---

## 1. Configure the Database

Edit `server/.env` and replace the placeholder with your real RDS connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@YOUR-RDS-HOST:5432/jobtracker?schema=public"
PORT=3001
```

> The database (`jobtracker`) must already exist. You can create it with:
> ```sql
> CREATE DATABASE jobtracker;
> ```

---

## 2. Run Migrations

```bash
cd server
npm install
npx prisma migrate dev --name init
```

This creates all four tables (`companies`, `jobs`, `contacts`, `followups`) in your database.

To apply migrations in production (without prompts):

```bash
npx prisma migrate deploy
```

---

## 3. Seed the Database

The seed file contains example jobs at Stripe, Vercel, Linear, Anthropic, and Shopify.

```bash
cd server
npm run seed
```

> To replace with your own jobs, edit `server/prisma/seed.js` before running.

---

## 4. Start the Backend

```bash
cd server
npm run dev        # development (nodemon, auto-restarts)
# or
npm start          # production
```

Server runs at `http://localhost:3001`.

---

## 5. Start the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Available Scripts

### Server (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start without nodemon |
| `npm run migrate` | Run Prisma migrations (dev) |
| `npm run migrate:deploy` | Apply migrations (production) |
| `npm run seed` | Seed example data |
| `npm run studio` | Open Prisma Studio (DB GUI) |
| `npm run generate` | Regenerate Prisma client |

### Client (`/client`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## API Endpoints

### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Summary stats (total, applied, interviewing, avg fit score) |

### Jobs
| Method | Path | Description |
|---|---|---|
| GET | `/api/jobs` | List jobs (supports `?status=`, `?workType=`, `?search=`, `?sortBy=`) |
| GET | `/api/jobs/:id` | Get single job with contacts and followups |
| POST | `/api/jobs` | Create job |
| PUT | `/api/jobs/:id` | Update job |
| PATCH | `/api/jobs/:id/status` | Quick status update |
| DELETE | `/api/jobs/:id` | Delete job |

### Companies
| Method | Path | Description |
|---|---|---|
| GET | `/api/companies` | List all companies |
| GET | `/api/companies/:id` | Get company with all its jobs |
| POST | `/api/companies` | Create company |
| PUT | `/api/companies/:id` | Update company |
| DELETE | `/api/companies/:id` | Delete company |

### Contacts
| Method | Path | Description |
|---|---|---|
| GET | `/api/contacts` | List all contacts |
| POST | `/api/contacts` | Create contact |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |

### Followups
| Method | Path | Description |
|---|---|---|
| GET | `/api/followups?jobId=X` | List followups for a job |
| POST | `/api/followups` | Log a followup |
| PUT | `/api/followups/:id` | Update followup |
| DELETE | `/api/followups/:id` | Delete followup |

---

## Features

- **Dashboard** — stats banner, filterable/searchable job cards grid
- **Job Detail** — full info, inline edit, contacts section, followup timeline
- **Companies** — card grid, click to see all jobs at that company
- **Contacts** — table view of all contacts, linked to job/company

---

## Prisma Studio

To browse/edit your database visually:

```bash
cd server
npm run studio
```

Opens at `http://localhost:5555`.
