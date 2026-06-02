# Open Source Licenses

This project uses or references the following open source software.

---

## Original countdown timer algorithm

**Author:** Mateusz Rybczonec  
**Reference:** https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/  
**License:** No explicit license. Algorithm and SVG ring technique credited in source file (`public/javascripts/countdown.js`).

The SVG circular progress ring pattern and JavaScript countdown logic in `countdown.js` is derived from this article.

---

## npm Production Dependencies

| Package | Version | License | Repository |
|---------|---------|---------|------------|
| [express](https://expressjs.com/) | ~4.16.1 | MIT | https://github.com/expressjs/express |
| [pug](https://pugjs.org/) | 2.0.0-beta11 | MIT | https://github.com/pugjs/pug |
| [morgan](https://github.com/expressjs/morgan) | ~1.9.1 | MIT | https://github.com/expressjs/morgan |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | ~1.4.4 | MIT | https://github.com/expressjs/cookie-parser |
| [http-errors](https://github.com/jshttp/http-errors) | ~1.6.3 | MIT | https://github.com/jshttp/http-errors |
| [debug](https://github.com/debug-js/debug) | ~2.6.9 | MIT | https://github.com/debug-js/debug |
| [qrcode](https://github.com/soldair/node-qrcode) | ^1.5.4 | MIT | https://github.com/soldair/node-qrcode |

---

## npm Dev Dependencies

| Package | Version | License | Notes |
|---------|---------|---------|-------|
| [pm2](https://pm2.keymetrics.io/) | ^5.4.1 | AGPL-3.0 | Process manager used in dev/staging only — **not** bundled in the production Docker image (`npm ci --omit=dev`) |

---

## Frontend CDN Resources

| Resource | Version | License | URL |
|----------|---------|---------|-----|
| [Font Awesome](https://fontawesome.com/) | 4.7.0 | MIT (font), SIL OFL 1.1 (icons) | https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/ |
| [Lato font](https://fonts.google.com/specimen/Lato) | — | SIL OFL 1.1 | https://fonts.google.com/specimen/Lato |

---

## This Project

**myRemoteTimer** — MIT License  
Copyright (c) 2024 Kai Steuernagel  
See [LICENSE](LICENSE) for full text.
