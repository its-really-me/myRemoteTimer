# CLAUDE.md — Project Context for Claude Code

## Project Summary

**remoteTimer** is a minimal countdown timer web application. The server is stateless — it serves HTML, CSS, JS, and audio assets. All timer logic runs client-side in the browser. The app is containerized and deployed as a Docker image on a serverless container platform.

## Tech Stack

### Runtime
- **Node.js** (LTS) — server runtime
- **Express.js ~4.16** — HTTP server and routing framework
- Vanilla JavaScript (ES5/ES6, no bundler or transpiler)

### Templating
- **Pug 2.0.0-beta11** — server-side HTML templates (views/)

### Middleware (Express)
| Package         | Version | Role                              |
|-----------------|---------|-----------------------------------|
| morgan          | ~1.9.1  | HTTP request logging              |
| cookie-parser   | ~1.4.4  | Cookie parsing                    |
| http-errors     | ~1.6.3  | HTTP error creation               |
| debug           | ~2.6.9  | Debug-mode logging                |

### Frontend
- Plain CSS3 (public/stylesheets/stylesheet.css)
- Vanilla JS (public/javascripts/countdown.js)
- SVG for circular progress ring animation
- Web Audio API via `<audio>` elements (MP3 jingles)
- Font Awesome (loaded from CDN in layout.pug)

### Dev Tooling
- **pm2 ^5.4.1** — process manager; used in dev/staging, not bundled in production image

## Docker & Deployment

- **Base image:** `node:lts-alpine` (minimal footprint)
- **Production build:** `npm ci --omit=dev` — dev dependencies excluded
- **Runs as:** non-root `node` user (security best practice)
- **Port:** 3000 (configurable via `PORT` env var)
- **Deployment target:** Serverless container platform (e.g. Google Cloud Run, AWS App Runner)
- Two Compose files:
  - `docker-compose.yml` — production (`NODE_ENV=production`)
  - `docker-compose.debug.yml` — development with Node.js inspector on port 9229

## Architecture

- **Pattern:** MVC-lite (Express routes → Pug views; no model/DB layer)
- **Stateless:** No database, no session storage; timer state lives in the browser only
- **Client-heavy:** Express serves assets and the initial HTML; countdown.js owns all timer behavior
- **No build pipeline:** No webpack, Babel, TypeScript, or CSS preprocessors

## Key Files

| File | Purpose |
|------|---------|
| [app.js](app.js) | Express app setup, middleware, route mounting, error handling |
| [bin/www](bin/www) | Server entry point, port binding, error handling |
| [routes/index.js](routes/index.js) | Renders the timer page |
| [views/index.pug](views/index.pug) | Timer page HTML structure |
| [public/javascripts/countdown.js](public/javascripts/countdown.js) | All client-side timer logic |
| [public/stylesheets/stylesheet.css](public/stylesheets/stylesheet.css) | Application styles |
| [Dockerfile](Dockerfile) | Container image definition |
| [docker-compose.yml](docker-compose.yml) | Production compose config |
| [docker-compose.debug.yml](docker-compose.debug.yml) | Debug compose config |

## License Notes

- This project: **MIT** (Copyright 2024 Kai Steuernagel)
- All production npm dependencies: **MIT**
- `pm2` (dev dependency): **AGPL-3.0** — not included in the production Docker image

## Common Commands

```bash
# Install dependencies
npm install

# Start locally
npm start

# Run production container
docker-compose up

# Run with debugger (port 9229)
docker-compose -f docker-compose.debug.yml up

# Build Docker image
docker build -t remote-timer .
```
