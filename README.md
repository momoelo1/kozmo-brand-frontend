# KoZmo — Frontend

Single-page storefront for the KoZmo e-commerce store. Built with React and Vite,
with Redux Toolkit for state and a Stripe-powered checkout.

## Tech stack

- **React 18 + Vite**
- **Redux Toolkit + React Redux** — state management
- **React Router** (HashRouter) — routing
- **Sass** — styling
- **Stripe** — checkout
- **i18n** — English / Italian / French, with multi-currency support
- **Vitest + React Testing Library** — tests

## Notes

- The app uses **HashRouter** so it can be served as static files (e.g. GitHub Pages).
- It talks to the backend API; the base URL is configured via `VITE_API_URL`
  (defaults to `/api`, which the dev server proxies to the backend).

## Getting started

### Prerequisites
- Node.js 18+
- The [backend API](../backend) running (or reachable via `VITE_API_URL`)

### Setup
```bash
npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:3001` (see `vite.config.js`).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | no | Backend API base URL (defaults to `/api`) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run the test suite |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Build and deploy to GitHub Pages |

## Testing

```bash
npm test
```

Tests use Vitest with React Testing Library in a jsdom environment.
