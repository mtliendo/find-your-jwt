# Find Your JWT

A Focus Otter browser game. Sign in with Auth0, walk a dim office, and find **your** JWT in a pile of lookalikes.

Inspired by Nas Nakarus's needle-in-a-haystack game. Luigi's Mansion energy, 2D, Phaser — not a 3D mansion and not a conference talk.

**Focus Otter first** ([@focusotter](https://x.com/focusotter)). Auth0 is the employer and the login.

## What it teaches

Anyone can decode a JWT. That is not identity.

1. You sign in with Auth0. The session ID token is real.
2. You spawn in a 2D office with ~100 JWT chips that all look the same.
3. One chip is **your** Auth0 ID token (match on `sub`). The rest are decoys: plausible JWT-shaped strings with other subjects, some expired, some wrong `aud`, some unsigned garbage that still decodes as JSON.
4. Hover with the magnifying glass to decode header + payload (jwt.io-style). Decode is free.
5. Click to claim. You win only if that token's `sub` is the signed-in user. The win screen can also show Auth0 JWKS signature verification — that is what makes the token actually yours.
6. Wrong claim: short fail, keep hunting.

## Stack

- Next.js App Router + TypeScript + pnpm
- Phaser 3 (client-only; never SSR'd)
- `@auth0/nextjs-auth0` v4
- shadcn-style / Tailwind chrome around the canvas
- Vercel-ready

## Run locally

```bash
pnpm install
cp .env.example .env.local
# fill in Auth0 values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You must sign in to play. There is no guest mode.

```bash
pnpm build
```

## Auth0 app setup

Create a **Regular Web Application** in the [Auth0 Dashboard](https://manage.auth0.com).

| Setting | Local value |
| --- | --- |
| Application type | Regular Web Application |
| Allowed Callback URLs | `http://localhost:3000/auth/callback` |
| Allowed Logout URLs | `http://localhost:3000` |
| Allowed Web Origins | `http://localhost:3000` |

Copy these into `.env.local`:

```env
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=
APP_BASE_URL=http://localhost:3000
```

Generate `AUTH0_SECRET` with:

```bash
openssl rand -hex 32
```

On Vercel, set the same variables. You can omit `APP_BASE_URL` on preview deploys so the SDK infers the host; add each preview callback/logout/web origin (or a wildcard pattern your tenant allows) in the Auth0 app.

The SDK mounts `/auth/login`, `/auth/callback`, `/auth/logout`, and `/auth/profile` via `proxy.ts`.

## Phaser + Next.js

Phaser needs `window`. This app loads the game with `next/dynamic(..., { ssr: false })` and a dynamic `import()` of `Phaser.Game` inside a client `useEffect`. That is enough to keep `pnpm build` from evaluating Phaser on the server.

## Controls

- **WASD** or arrow keys — walk
- **Mouse** — magnifying glass; hover to decode; click to claim
