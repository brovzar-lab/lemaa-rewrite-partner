# Rewrite Partner

A collaborative screenplay rewriting tool for screenwriters. Features a three-panel layout: notes, Tiptap screenplay editor, and AI writing partner powered by Claude.

## Local Development

```bash
# From the monorepo root
npm install
npm run dev --workspace=apps/rewrite-partner
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values.

**Never commit `.env.local` to git.**

| Variable | Required | Purpose |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Production | Firebase Auth + Firestore + Storage |
| `VITE_FIREBASE_AUTH_DOMAIN` | Production | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Production | Firestore database |
| `VITE_FIREBASE_STORAGE_BUCKET` | Production | File storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Production | Firebase messaging |
| `VITE_FIREBASE_APP_ID` | Production | Firebase app |
| `VITE_ANTHROPIC_API_KEY` | Production | Claude API for AI Partner panel |

### Demo Mode

If any Firebase variable is missing or set to `REPLACE_WITH_VALUE`, the app automatically enters **demo mode**:
- Auth screen shows a "Continue as Demo User" button
- All panels load with realistic hardcoded screenplay data
- Write operations show a "Demo mode — not saved" toast instead of erroring
- A "Demo Mode" badge appears in the header

**Vercel preview deployments** — omit all env vars to get automatic demo mode.
**Production deployment** — set all vars above in Vercel project settings.

## Vercel Deployment

The app deploys to Vercel automatically when changes are pushed to `main`.

In your Vercel project settings, set:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite
- **Root Directory**: `apps/rewrite-partner`

Set all environment variables listed above under **Settings → Environment Variables**.

## CI

GitHub Actions runs `npm run typecheck && npm run build` on every push or PR touching `apps/rewrite-partner/**`.
