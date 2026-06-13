# CityTrace WeChat Mini Program

Native WeChat Mini Program implementation of the CityTrace Amsterdam journey.
It mirrors the website journey behavior while using WeChat map, location,
storage, and request APIs.

## Included

- Ordered trip timeline and synchronized map markers.
- Place details, stories, saved places, and arrival progression.
- WeChat location permission flow with nearby-arrival detection.
- Versioned local persistence for offline progress and saves.
- Shared `/v1` backend integration with fixture fallback.
- Contract tests for state sanitization, progress, and location distance.

## Open In WeChat Developer Tools

1. Import this `wechat` directory as a Mini Program project.
2. Replace the placeholder AppID in `project.config.json`, or use the
   Developer Tools test AppID.
3. Register `https://citytrace.movenova.ai` as a request domain in the WeChat
   admin console.
4. Enable location permission for the Mini Program before submission.

The production API is configured in `config.js`. If it is unavailable, the app
uses the bundled Amsterdam fixtures and remains fully usable.
Developer Tools may create `project.private.config.json`; it is intentionally
ignored so a local AppID is not committed.

## Validation

From the repository root:

```powershell
npm run wechat:test
npm run wechat:check
```

`wechat:check` validates JSON configuration and scans JavaScript files for
syntax errors. Final device and submission validation must still be completed
in WeChat Developer Tools.
