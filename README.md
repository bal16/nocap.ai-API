# Elysia with Bun runtime

## Getting Started

To get started with this template, simply paste this command into your terminal:

```bash
bun create elysia ./elysia-example
```

## Development

To start the development server run:

```bash
bun run dev
```

## Tree

```text
├──  .env //ignored
├──  .env.example
├──  node_modules
├──  package.json
├──  prisma
│   ├──  generated //ignored
│   ├──  migrations //ignored
│   └──  schema.prisma
├──  prisma.config.ts
├──  README.md
├── 󱧼 src
│   ├──  config
│   │   ├──  auth.ts
│   │   └──  db.ts
│   ├──  features
│   │   └──  auth
│   │   └──  example
│   │       ├──  example.model.ts
│   │       ├──  example.service.ts
│   │       └──  routes.ts
│   ├──  main.ts
│   ├──  plugins
│   │   └──  openApi.ts
│   └──  shared
└──  tsconfig.json
```

Open http://localhost:3000/ with your browser to see the result.

## References

- [ElysiaJs Best Practice](https://elysiajs.com/essential/best-practice)
- [🦊 Bun + Elysia + Postgres.js Clean Architecture Example](https://github.com/lukas-andre/bun-elysia-clean-architecture-example)
- [Project Tree Generator](https://woochanleee.github.io/project-tree-generator)
