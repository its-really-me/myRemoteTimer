# myRemoteTimer — Countdown Timer

A lightweight, browser-based countdown timer application built with Express.js and vanilla JavaScript. Designed for use in meetings, presentations, or any scenario requiring a shared visual timer. Deployed as a Docker image on serverless infrastructure.

## Features

- SVG-based circular progress ring with animated countdown
- Color-coded time thresholds:
  - Green — normal (> 25% remaining)
  - Orange — warning (25%–10% remaining)
  - Red — alert (< 10% remaining)
- Audio feedback for pause, reset, and time-up events
- Configurable duration via URL parameter (`?duration=<seconds>`) or in-page dialog
- Default duration: 120 seconds (2 minutes)
- Per-session timer IDs — multiple independent timers can run simultaneously
- Read-only view page for audience display, auto-syncing every 3 seconds
- QR code on the timer page links directly to the matching read-only view

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm

### Local Development

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. A session ID is auto-generated and appended to the URL (e.g. `/?id=<uuid>`).


## Read-Only View

Each timer session exposes a read-only graphical view at:

```
/api/view?id=<uuid>
```

- Mirrors the timer state in real time (syncs every 3 seconds via page reload)
- Shows the circular progress ring and countdown — no controls
- If the timer is paused or stopped for more than 3 minutes, auto-sync stops and a **Sync again** button appears
- The QR code in the bottom-left corner of the main timer page encodes this URL for easy access from a phone or second screen

## API

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/status?id=<id>` | Returns current timer state as JSON |
| POST   | `/api/status?id=<id>` | Updates timer state from the client |

State shape:

```json
{
  "setTime": 120,
  "timeLeft": 55,
  "status": "running",
  "statusChangedAt": 1711234567890
}
```

`status` is one of: `running` | `paused` | `stopped` | `finished`

## Docker

### Build and run with Docker Compose (production)

```bash
docker-compose up
```

### Debug mode (exposes Node.js debugger on port 9229)

```bash
docker-compose -f docker-compose.debug.yml up
```

### Build image manually

```bash
docker build -t my-remote-timer .
docker run -p 3000:3000 my-remote-timer
```

### Pre-built image (GitHub Container Registry)

```bash
docker pull ghcr.io/its-really-me/my-remote-timer:latest
docker run -p 3000:3000 ghcr.io/its-really-me/my-remote-timer:latest
```

The application listens on port **3000** by default. Override with the `PORT` environment variable.

### Environment Variables

| Variable   | Default                  | Description                                                                 |
|------------|--------------------------|-----------------------------------------------------------------------------|
| `PORT`     | `3000`                   | Port the HTTP server listens on                                              |
| `BASE_URL` | `http://localhost:3000`  | Public base URL of the app, used to generate the QR code link on the timer page |

`BASE_URL` must be set to the externally reachable URL when deploying (e.g. `https://your-app.run.app`). Without it, the QR code will encode a localhost URL that is not reachable from other devices.

## Deployment

The application is packaged as a Docker image and deployed on **Google Cloud Run**. The image is based on `node:lts-alpine` and runs as a non-root `node` user for security.

Key deployment characteristics:
- Stateless between restarts — timer state is in-memory only
- Single container, no external services
- Port `3000` exposed by default
- `NODE_ENV=production` disables development middleware

### Google Cloud Run (manual deploy)

```bash
# 1. Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Create Artifact Registry repository (once)
gcloud artifacts repositories create my-remote-timer \
  --repository-format=docker \
  --location=europe-north1

# 3. Build and push image
gcloud builds submit --tag europe-north1-docker.pkg.dev/YOUR_PROJECT_ID/my-remote-timer/my-remote-timer:latest

# 4. Deploy
gcloud run deploy my-remote-timer \
  --image europe-north1-docker.pkg.dev/YOUR_PROJECT_ID/my-remote-timer/my-remote-timer:latest \
  --region europe-north1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production,BASE_URL=https://YOUR_CLOUD_RUN_URL
```

### Google Cloud Run (CI/CD via Cloud Build)

A `cloudbuild.yaml` is included. Connect the GitHub repo in the Cloud Build console and set the following substitution variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `_REGION` | GCP region | `europe-north1` |
| `_REPO` | Artifact Registry repo name | `my-remote-timer` |
| `_SERVICE_URL` | Cloud Run service URL (set after first deploy) | `my-remote-timer-abc123-ew.a.run.app` |

Cloud Build triggers a build + deploy on every push to `main`.

## Project Structure

```
myRemoteTimer/
├── app.js                    # Express app configuration
├── bin/www                   # HTTP server entry point
├── routes/
│   ├── index.js              # Page routes (session ID generation, QR code)
│   ├── api.js                # Timer state API + view route
│   └── users.js              # Placeholder
├── views/
│   ├── layout.pug            # Base HTML layout
│   ├── index.pug             # Main timer page
│   ├── timer-view.pug        # Read-only view page
│   └── error.pug             # Error page
└── public/
    ├── javascripts/
    │   ├── countdown.js      # Client-side timer logic (controller)
    │   └── timer-view.js     # Client-side logic for read-only view
    ├── stylesheets/
    │   └── stylesheet.css    # Application styles
    ├── images/               # Static assets
    └── jingles/              # Audio feedback (MP3)
```

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

Copyright (c) 2024 Kai Steuernagel

### Open Source Dependencies

All production dependencies are MIT-licensed:

| Package        | License | Purpose                         |
|----------------|---------|---------------------------------|
| express        | MIT     | Web application framework       |
| pug            | MIT     | Server-side HTML templating     |
| morgan         | MIT     | HTTP request logging middleware |
| cookie-parser  | MIT     | Cookie parsing middleware       |
| http-errors    | MIT     | HTTP error object creation      |
| debug          | MIT     | Debug logging utility           |
| qrcode         | MIT     | Server-side QR code generation  |

Dev dependency:

| Package | License  | Purpose                           |
|---------|----------|-----------------------------------|
| pm2     | AGPL-3.0 | Process manager (dev/staging use) |

> **Note:** pm2 is licensed under AGPL-3.0. It is only used as a development/tooling dependency and is not bundled into the production Docker image (installed with `--omit=dev`).
