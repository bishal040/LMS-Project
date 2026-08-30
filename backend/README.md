# LMS Backend (Strapi v5)

Welcome to the backend repository for the **LMS Project**. This application is built using [Strapi v5](https://strapi.io/), a leading open-source headless CMS based on Node.js. It provides the core API, database management, and content administration panel for the entire Learning Management System.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure & Navigation](#-project-structure--navigation)
- [Available Commands](#-available-commands)
- [Environment Variables](#-environment-variables)
- [Testing & Custom Scripts](#-testing--custom-scripts)
- [Deployment](#-deployment)

---

## 🛠 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or higher (up to `26.x.x` supported)
- **npm**: `v6.x` or higher (or `yarn`/`pnpm`)
- **Database**: SQLite is used locally by default, but PostgreSQL is also supported in production.

---

## 🚀 Getting Started

Follow these step-by-step instructions to get the backend running locally.

### 1. Install Dependencies

Open your terminal, navigate to the `backend` directory, and run:

```bash
npm install
```

### 2. Configure Environment Variables

If you don't have a `.env` file, create one in the root of the `backend` directory. (You can copy the contents of `.env.example` if it exists).
Ensure your `.env` contains the required App Keys, API Tokens, and Database configurations.

### 3. Run the Development Server

Start the Strapi backend with auto-reload enabled. This is the mode you should use for local development:

```bash
npm run develop
```

Once started, your application will be available at:
- **API URL**: [http://localhost:1337](http://localhost:1337)
- **Admin Panel**: [http://localhost:1337/admin](http://localhost:1337/admin)

> **Note**: You will be prompted to create your first Administrator account when you access the Admin Panel for the first time.

---

## 📁 Project Structure & Navigation

Understanding the Strapi directory structure is crucial for navigating and customizing the backend:

- `src/api/`: **Core API.** Contains your generated Content Types, Controllers, Routes, and Services (e.g., `courses`, `enrollments`, `users`). 
  - *Example*: To edit the custom logic for enrollments, look inside `src/api/enrollment/`.
- `src/components/`: **Components.** Reusable data structures used across multiple Content Types.
- `src/extensions/`: **Plugin Extensions.** Used to override or customize existing Strapi plugins.
  - *Example*: User roles & permissions logic can be extended in `src/extensions/users-permissions/`.
- `config/`: **Configurations.** Holds database, server, middleware, and plugin configurations (`server.js`, `database.js`, etc.).
- `database/`: **Database Data.** Stores the SQLite database file (`data.db`) during local development.
- `public/`: **Static Assets.** Uploaded files and media are stored in `public/uploads/` when using the local provider.

---

## 📜 Available Commands

Here are the most common commands you will use while developing:

| Command | Description |
| :--- | :--- |
| `npm run develop` | Starts the server in development mode with auto-reloading enabled. |
| `npm run start` | Starts the server in production mode (auto-reloading disabled). |
| `npm run build` | Builds the Strapi admin UI panel for production. |
| `npm run console` | Opens the Strapi interactive CLI console. |

---

## 🔐 Environment Variables

The backend relies on various environment variables to function correctly. Key variables include:

- `HOST`: The host address (default: `0.0.0.0`)
- `PORT`: The port the app runs on (default: `1337`)
- `APP_KEYS`: Keys used to sign session cookies.
- `API_TOKEN_SALT`: Salt used to generate API tokens.
- `ADMIN_JWT_SECRET`: Secret used for the Admin panel authentication.
- `JWT_SECRET`: Secret used for Users-Permissions (end-users) authentication.

*Make sure to keep your secrets safe and never commit the `.env` file to version control.*

---

## 🧪 Testing & Custom Scripts

If you need to run one-off scripts that interact with the Strapi instance programmatically (like counting records, database migrations, etc.), you can use the Strapi context.

**Example script execution:**
```bash
# We have a script available to test document counting:
node test-count.js
```
*(Note: Custom scripts use `createStrapi` from `@strapi/strapi` to instantiate the application context in Strapi v5).*

---

## 🌍 Deployment

To deploy your Strapi backend to a production environment:

1. Build the admin panel:
   ```bash
   npm run build
   ```
2. Start the application in production mode:
   ```bash
   npm run start
   ```

You can deploy to platforms like [Strapi Cloud](https://cloud.strapi.io), Heroku, DigitalOcean, or AWS. Always ensure that `NODE_ENV=production` is set in your deployment environment and that you are using a robust database like PostgreSQL or MySQL.

---
*For more detailed documentation on Strapi itself, visit the [official Strapi documentation](https://docs.strapi.io).*
