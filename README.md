# fed-webapp

Nuxt 3 frontend for the FED application.

---

## Overview

This repository contains the web client used to interact with the FED backend API (`fed-api`). The app runs in development mode on port `3000` and expects the backend to be reachable (by default) at `http://localhost:8000`.

---

## Tech Stack

- Language: TypeScript / JavaScript
- Framework: Nuxt 3 (Vue 3)
- Database: None (frontend only; uses the backend API)
- Tooling / CI: Docker Compose, npm, Playwright (component, integration, E2E), Tailwind CSS, PrimeVue

---

## Getting Started

### Prerequisites

- Node.js (if running without Docker) or Docker + Docker Compose v2
- The backend API running locally (`fed-api`)

Example local workspace layout (adjust to your own environment):

- Frontend: `~/projects/fed-webapp` (example)
- Backend: `~/projects/fed-api` (example)

---

## Installation

```bash
git clone <repository-url>
cd fed-webapp
```

```bash
# build the local frontend image with Node, npm dependencies,
# Playwright Chromium, and the required system libraries
docker compose build nuxt
```

The Docker image already contains the Playwright browser runtime and npm dependencies needed by the test suites. Rebuild it whenever `package.json`, `package-lock.json`, or the Playwright version changes, or when you need to pick up other dependency-level changes.

For normal day-to-day development (changing only application source code), you typically do **not** need to rebuild the image or rerun `npm ci` / `npm install`; Nuxt will hot-reload your changes. If you intentionally modify dependencies from inside the running container (for example, when debugging), run `npm ci` or `npm install` inside that container instead of rebuilding immediately:

```bash
docker compose run --rm nuxt npm ci
```

---

## Configuration

Copy the example env file:

```bash
cp .env.example .env
```

Environment variables:

```env
NUXT_PUBLIC_BACKEND_URL=http://localhost:8000
NUXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

The repository also contains a versioned `.env.test` used automatically by Playwright. It provides Docker-friendly defaults for browser tests, including the deterministic E2E accounts.

---

## Usage

```bash
# start the dev server (http://localhost:3000)
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

---

## Testing

```bash
# run Playwright component tests
docker compose run --rm --remove-orphans nuxt npm run test:component

# run Playwright integration tests
docker compose run --rm --remove-orphans nuxt npm run test:integration

# run both browser suites
docker compose run --rm --remove-orphans nuxt npm run test:browser

# run the real-backend E2E scaffold explicitly
docker compose run --rm --remove-orphans nuxt npm run test:e2e

# open the Playwright UI for the E2E scaffold
docker compose run --rm --remove-orphans nuxt npm run test:e2e:ui
```

Guidelines:

- Tests are required for behavioral changes
- All tests must pass before opening a PR
- Local Docker runs use the custom image from `./docker/Dockerfile`, not the plain Node base image.
- `tests/component` contains Playwright component tests for mountable Vue leaf components.
- `tests/integration` contains browser tests against the real Nuxt app with mocked HTTP.
- `tests/e2e` is scaffolded for the real frontend + real `fed-api` stack.
- The current frontend still targets legacy API contracts in several domains, so the real-backend E2E specs are intentionally skipped until the contract-alignment work lands.
- `playwright.config.ts` loads `.env` then `.env.test`; shell-provided variables still win over both files.

### Local Playwright E2E bootstrap

Use the backend clone at `/home/nathan/PhpstormProjects/fed-api` and follow its README for Docker setup.

Recommended local bootstrap:

```bash
cd /home/nathan/PhpstormProjects/fed-api
cp .env.example .env
printf '\nHOST_UID=%s\nHOST_GID=%s\nMAIL_MAILER=log\nAPP_FRONTEND_URL=http://127.0.0.1:3000\n' "$(id -u)" "$(id -g)" >> .env
docker compose run --rm --no-deps --build laravel composer install
docker compose run --rm --no-deps laravel php artisan key:generate
docker compose up -d --build
```

The versioned `.env.test` already contains the deterministic Playwright account values used by the scaffold:

```env
NUXT_PUBLIC_BACKEND_URL=http://host.docker.internal:8000
PLAYWRIGHT_USER_EMAIL=playwright-user@example.test
PLAYWRIGHT_ADMIN_EMAIL=playwright-admin@example.test
PLAYWRIGHT_E2E_PASSWORD=password
```

Override them in the shell only when you intentionally want different accounts or endpoints.

---

## Linting

```bash
# run ESLint
docker compose run --rm nuxt npm run lint

# apply auto-fixes
docker compose run --rm nuxt npm run lint:fix

# format with Prettier
docker compose run --rm nuxt npm run format

# check formatting only
docker compose run --rm nuxt npm run format:check
```

---

## Contributing

Contributions require the copyright holder's prior express written permission.

Please read the **CONTRIBUTING.md** file before opening an issue or pull request. It contains detailed guidelines on:

- Branch naming
- Commit message conventions
- Pull request process
- Review and merge rules

---

## Internal Docs

- [`docs/AUTH_STATELESS.md`](./docs/AUTH_STATELESS.md)
- [`docs/API_FOUNDATION.md`](./docs/API_FOUNDATION.md)

---

## License

Copyright (c) 2026 Nathan OUDER EI. All rights reserved.

This project is proprietary. No permission is granted to use, copy, modify,
distribute, or otherwise exploit it. See [LICENSE](LICENSE) for the full terms.
