# remoteTimer — Countdown Timer

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
- Fully client-side timer logic — stateless server, no database required

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm

### Local Development

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### URL Parameters

| Parameter  | Description                        | Example               |
|------------|------------------------------------|-----------------------|
| `duration` | Countdown duration in seconds      | `?duration=300` (5 min) |

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
docker build -t remote-timer .
docker run -p 3000:3000 remote-timer
```

The application listens on port **3000** by default. Override with the `PORT` environment variable.

## Deployment

The application is packaged as a Docker image and deployed on a **serverless container platform** (e.g. Google Cloud Run, AWS App Runner, or similar). The image is based on `node:lts-alpine` and runs as a non-root `node` user for security.

Key deployment characteristics:
- Stateless — no persistent storage required
- Single container, no external services
- Port `3000` exposed by default
- `NODE_ENV=production` disables development middleware

## Project Structure

```
remoteTimer/
├── app.js                    # Express app configuration
├── bin/www                   # HTTP server entry point
├── routes/
│   └── index.js              # Page routes
├── views/
│   ├── layout.pug            # Base HTML layout
│   ├── index.pug             # Timer page
│   └── error.pug             # Error page
└── public/
    ├── javascripts/
    │   └── countdown.js      # Client-side timer logic
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

Dev dependency:

| Package | License | Purpose                          |
|---------|---------|----------------------------------|
| pm2     | AGPL-3.0 | Process manager (dev/staging use) |

> **Note:** pm2 is licensed under AGPL-3.0. It is only used as a development/tooling dependency and is not bundled into the production Docker image (installed with `--omit=dev`).
