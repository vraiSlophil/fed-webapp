# fed-webapp

Nuxt 3 frontend for the FED application.

---

## Overview

This repository contains the web client used to interact with the FED backend API (`fed-api`). The app runs in development mode on port `3000` and expects the backend to be reachable (by default) at `http://localhost:8000`.

---

## Tech Stack

* Language: TypeScript / JavaScript
* Framework: Nuxt 3 (Vue 3)
* Database: None (frontend only; uses the backend API)
* Tooling / CI: Docker Compose, npm, Cypress (E2E), Tailwind CSS, PrimeVue

---

## Getting Started

### Prerequisites

- Node.js (if running without Docker) or Docker + Docker Compose v2
- The backend API running locally (`fed-api`)

---

## Installation

```bash
git clone <repository-url>
cd fed-webapp
```

```bash
# install dependencies
docker compose run --rm nuxt npm ci
```

if there is no `package-lock.json`, run :
```bash
docker compose run --rm nuxt npm install
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
# open Cypress (interactive)
docker compose exec nuxt npm run test:e2e

# run Cypress headless
docker compose exec nuxt npm run test:e2e:headless
```

Guidelines:

* Tests are required for behavioral changes
* All tests must pass before opening a PR

---

## Contributing

Contributions are welcome.

Please read the **CONTRIBUTING.md** file before opening an issue or pull request. It contains detailed guidelines on:

* Branch naming
* Commit message conventions
* Pull request process
* Review and merge rules

---

## License

No license has been specified yet.
