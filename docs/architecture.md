# CityTrace Architecture

CityTrace is organized as a multi-client product with one shared backend.

```text
web/       Next.js website and browser experience
ios/       Native SwiftUI client
android/   Native Jetpack Compose client
wechat/    WeChat Mini Program
backend/   Shared API and geospatial services
docs/      Cross-platform architecture and contracts
```

## Website Foundation

The original static MVP now runs as typed React components inside the Next.js
App Router:

- `web/src/features/journey/data.ts` contains the Amsterdam trip fixture.
- `web/src/features/journey/types.ts` defines client domain contracts.
- `web/src/features/journey/use-journey.ts` owns journey state and actions.
- Feature components own the sidebar, timeline, map, and detail presentation.
- `web/src/app/globals.css` retains the accepted visual system.

See `docs/phase-1-web.md` for delivered scope and Phase 1 exit criteria.

## Deployment

Deploy the `web` directory through Cloudflare Pages:

- Build command: `npm run build`
- Build output directory: `out`
- Production branch: `main`
- Production hostname: `https://citytrace.movenova.ai`

`web/wrangler.jsonc` records the Pages output directory so local and hosted
deployments use the same artifact contract.
