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

## Web Migration

The original static MVP now runs inside the Next.js App Router. Its existing
markup, styles, and interactions are preserved as a migration boundary:

- `web/src/content/mvp.html` contains the existing MVP markup.
- `web/src/app/globals.css` contains the existing visual system.
- `web/public/mvp.js` contains current browser interactions and local state.
- `web/src/app/page.tsx` renders the MVP through Next.js.

This keeps the deployed product stable while individual areas are converted to
React components in later changes.

## Deployment

Deploy the `web` directory as the project root. The production hostname is:

`https://citytrace.movenova.ai`

DNS and hosting-provider domain assignment are operational configuration and
are intentionally not stored as credentials in this repository.
