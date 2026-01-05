# PROOFCHAIN ✅

A prototype React + TypeScript app for provenance and product tracking using Firebase Firestore and Auth. Built with Vite, Tailwind CSS and a shadcn/ui-inspired component set.

---

## Table of Contents
- 🔧 Features
- 🧩 Tech stack
- 🚀 Quick start
- 🔐 Environment & Firebase
- 🌱 Seed data
- 📁 Project structure
- 🛠️ Scripts
- 🤝 Contributing
- ⚠️ Notes & troubleshooting

---

## 🔧 Features
- Track products, batches, events and stakeholders
- Firebase Auth (session persistence) + Firestore as backend
- UI components for dashboard, product tracking, QR scanning and verification assistant
- Sample product seed data for demo/testing

---

## 🧩 Tech stack
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Firebase (Firestore + Auth)
- Radix UI primitives, Recharts, React Router, Zustand

---

## 🚀 Quick start

1. Install prerequisites

```bash
# Node 18+ recommended
pnpm install
```

2. Run dev server

```bash
pnpm dev
# launches Vite dev server (hot reload)
```

3. Build / preview

```bash
pnpm build
pnpm preview
```

4. Lint

```bash
pnpm lint
```

---

## 🔐 Environment & Firebase
- The repo currently includes a sample Firebase config in `src/lib/firebase.ts` for demo purposes.
- For production, move configs into environment variables and read them via Vite env vars.

Recommended `.env` keys (root):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Then update `src/lib/firebase.ts` to use `import.meta.env.VITE_FIREBASE_*`.

> Tip: Keep secrets out of git. Use a secrets manager for production credentials.

---

## 🌱 Seed data
- `seedProducts()` in `src/lib/firebase.ts` contains multiple sample products across categories (electronics, pharmaceuticals, food, etc.).
- To populate Firestore with sample data for development, import and call `seedProducts()` once (for example in a dev-only route or a temporary script).

Example usage:

```ts
import { seedProducts } from './lib/firebase';
await seedProducts();
```

---

## 📁 Project structure (high level)
- `src/` — application source
  - `components/` — feature components (Dashboard, ProductTracking, QRScanner, etc.)
  - `lib/` — `firebase.ts`, blockchain helpers and utilities
  - `ui/` — shared UI primitives
  - `pages/` — top-level routes
- `package.json` — scripts & deps

---

## 🛠️ NPM scripts
- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm preview` — preview build locally
- `pnpm lint` — run ESLint on `src`

(See `package.json` for full dependency details.)

---

## 🤝 Contributing
- Open issues for bugs or feature requests.
- Send PRs against `main`. Keep changes small and focused; add tests where applicable.
- Consider adding a `LICENSE` file to clarify repo usage.

---

## ⚠️ Notes & troubleshooting
- The repository currently includes an in-file Firebase config (for demo). Replace with env vars for production use.
- If you encounter Firestore permission errors, confirm your Firebase rules and authorized domains.
- Auth session behavior uses `browserSessionPersistence` (see `src/lib/firebase.ts`).

---

If you'd like, I can:
- ✅ Add README badges, screenshots, or a short architecture diagram
- ✏️ Create a `CONTRIBUTING.md` or `LICENSE` file
- 🔐 Replace the in-file Firebase config with `import.meta.env` usage and add an example `.env.example`

Tell me which follow-up you'd like me to do next.
