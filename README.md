# CityTrace

CityTrace is a cross-platform, story-led city exploration product. This
repository contains the website, native client workspaces, WeChat client, and
shared backend boundary.

## Repository

| Folder | Purpose |
| --- | --- |
| `web` | Next.js website and browser MVP |
| `ios` | Native SwiftUI client |
| `android` | Native Jetpack Compose client |
| `wechat` | WeChat Mini Program |
| `backend` | Shared API and geospatial services |
| `docs` | Architecture and API contracts |

## Web

The existing highlight, timeline, map, arrival, progress, and saved-place MVP
has been migrated into the Next.js App Router under `web`.

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

Production website: [citytrace.movenova.ai](https://citytrace.movenova.ai)

Cloudflare Pages deployment settings:

- Root directory: `web`
- Build command: `npm run build`
- Build output directory: `out`
- Production branch: `main`

The custom domain is `citytrace.movenova.ai`.

## Architecture

See [docs/architecture.md](docs/architecture.md) for platform boundaries and
[docs/api-contract.md](docs/api-contract.md) for the initial shared API shape.
