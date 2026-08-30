# LMS Project

Welcome to the full-stack repository for the **LMS Project**. This project consists of a Next.js frontend application for users, and a Strapi v5 backend that provides the core API, database management, and content administration panel.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Backend Setup (Strapi)](#1-backend-setup-strapi)
  - [Frontend Setup (Next.js)](#2-frontend-setup-nextjs)
- [Project Structure & Navigation](#-project-structure--navigation)
- [Available Commands](#-available-commands)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)

---

## 📖 Project Overview

- **Frontend:** Built with [Next.js](https://nextjs.org) (App Router), React, and styled with modern CSS practices. It's located in the `frontend/` directory.
- **Backend:** Built with [Strapi v5](https://strapi.io/), a leading open-source headless CMS based on Node.js. It's located in the `backend/` directory.

---

## 🛠 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or higher
- **npm**: `v6.x` or higher (or `yarn`/`pnpm`)

---

## 🚀 Getting Started

Follow these step-by-step instructions to get both the backend and frontend running locally.

### 1. Backend Setup (Strapi)

Open your terminal, navigate to the `backend` directory, and follow these steps:

```bash
cd backend
npm install
```

Start the Strapi backend with auto-reload enabled for local development:

```bash
npm run develop
```

Once started, your backend will be available at:
- **API URL**: [http://localhost:1337](http://localhost:1337)
- **Admin Panel**: [http://localhost:1337/admin](http://localhost:1337/admin) (Create your first administrator account here)

### 2. Frontend Setup (Next.js)

Open a new terminal window, navigate to the `frontend` directory, and follow these steps:

```bash
cd frontend
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the frontend application. The page auto-updates as you edit the files in `frontend/src/` or `frontend/app/`.

---

## 📁 Project Structure & Navigation

Understanding the monorepo-style structure is crucial for navigating and customizing the project:

### Root Directory
- `frontend/`: The Next.js web application.
- `backend/`: The Strapi headless CMS application.
- `permission_matrix.md`: Contains role and permissions configurations documentation.
- `what_needs_to_update.md` / `project_review.md`: Project management and review notes.

### Backend (`/backend`)
- `src/api/`: **Core API.** Contains your generated Content Types, Controllers, Routes, and Services.
- `src/extensions/`: **Plugin Extensions.** Used to override or customize existing Strapi plugins (e.g. `users-permissions`).
- `config/`: **Configurations.** Holds database, server, middleware, and plugin configurations.
- `database/`: **Database Data.** Stores the SQLite database file (`data.db`) during local development.

### Frontend (`/frontend`)
- `app/` or `src/app/`: **Next.js App Router.** Contains all your pages and routing logic.
- `src/components/`: **Reusable Components.** Shared UI elements used across the frontend.

---

## 📜 Available Commands

### Backend Commands (run inside `/backend`)
| Command | Description |
| :--- | :--- |
| `npm run develop` | Starts the server in development mode with auto-reloading enabled. |
| `npm run start` | Starts the server in production mode (auto-reloading disabled). |
| `npm run build` | Builds the Strapi admin UI panel for production. |

### Frontend Commands (run inside `/frontend`)
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js server in development mode. |
| `npm run build` | Builds the application for production usage. |
| `npm run start` | Starts a Next.js production server. |

---

## 🔐 Environment Variables

### Backend (`/backend/.env`)
The backend relies on environment variables for security and configurations. Make sure to define:
- `HOST` and `PORT` (default: 1337)
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`

### Frontend (`/frontend/.env.local`)
The frontend may require environment variables to connect to the API. For example:
- `NEXT_PUBLIC_API_URL=http://localhost:1337`

*Make sure to keep your secrets safe and never commit `.env` files to version control.*

---

## 🌍 Deployment

**Backend (Strapi):**
Deploy your backend to platforms like [Strapi Cloud](https://cloud.strapi.io), Heroku, or AWS. Build the admin panel first (`npm run build`), then start the app (`npm run start`). Ensure you use a robust database like PostgreSQL in production.

**Frontend (Next.js):**
The easiest way to deploy your Next.js app is using the [Vercel Platform](https://vercel.com/new). You can also deploy to any Node.js hosting provider by building (`npm run build`) and starting (`npm run start`).
