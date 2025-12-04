# NoCap.AI Backend (Elysia + Bun)

Backend API for a Marketing Sosmed App: auth, image uploads, AI-assisted content generation, and engagement analytics.

## Tech Stack

- Runtime: Bun
- Framework: Elysia
- DB: Postgres (via Prisma)
- Auth: Better Auth (JWT)?
- Docs: @elysiajs/openapi (Swagger UI)

## Getting Started

### Prerequisites

- Bun installed:
  curl -fsSL <https://bun.sh/install> | bash
- Postgres running and accessible (you can also use [docker-compose](docker-compose.yaml))

### Install

```bash
bun install
```

### Environment

Copy and configure environment variables:

```bash
cp .env.example .env
# edit .env with DB url, auth secrets, S3/R2 credentials, etc.
```

### Development

```bash
docker-compose up -d
# podman-compose up -d

bun run dev
# open http://localhost:3000
# OpenAPI docs at http://localhost:3000/docs (depending on plugin path)
```

### Database (Prisma)

```bash
# generate client
bun prisma generate

# run migrations
bun prisma migrate dev

```

## Project Structure

```text
├── .env
├── .env.example
├── package.json
├── prisma
│   ├── migrations
│   └── schema.prisma
├── prisma.config.ts
├── README.md
├── src
│   ├── config
│   │   ├── auth.ts
│   │   └── db.ts
│   ├── features
│   │   ├── auth
│   │   └── upload
│   ├── main.ts
│   ├── plugins
│   └── shared
└── tsconfig.json
```

## Features

- Auth
  - Email/Password
  - Google OAuth
- Image Post
  - Upload Image (presigned URL)
  - Caption Generation
  - Song Recommendation
  - Topic Generation
  - History Generation
- Engagement Analytics

## API Contract

See contract.md for endpoint shapes and example payloads/responses.

## OpenAPI

- Tags grouped by features in src/plugins/open-api.ts
- Route schemas (body, response, detail) live next to controllers (e.g., src/features/upload)

## Scripts

```bash
# start dev
bun run dev

# typecheck
bun run typecheck

# lint (if configured)
bun run lint

# tests (if configured)
bun test
```

## Deployment Notes

- Set production environment variables (JWT secrets, DB URL, object storage keys).
- Configure CORS, TLS/HTTPS, and reverse proxy (e.g., Nginx).
- Enable health endpoints and monitoring.
