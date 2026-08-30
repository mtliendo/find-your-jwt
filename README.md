# Find Your JWT

A Focus Otter browser game. Walk a dim office and find **your** JWT in a pile of lookalikes.

Inspired by Nas Nakarus's needle-in-a-haystack game. Luigi's Mansion energy, 2D, Phaser — not a 3D mansion and not a conference talk.

**Focus Otter first** ([@focusotter](https://x.com/focusotter)). Auth0 is the employer and the optional login.

## Guest play (default)

`pnpm dev` with no `.env.local` loads the office immediately. No Auth0 redirect.

A local guest identity (`sub` + email) is minted and that token is the needle. Claim wins on **sub match** of the guest token. JWKS cannot verify a local guest token.

When Auth0 env is fully set and you sign in, the needle is your real ID token and the win gate is **JWKS verify AND sub match**.

## What it teaches

Anyone can decode a JWT. That is not identity.

1. You spawn in a 2D office with ~100 JWT chips that all look the same.
2. One chip is yours (guest token, or your Auth0 ID token when signed in). The rest are Auth0-shaped decoys.
3. First tap inspects and keeps the decode HUD. Decode is free.
4. Claim is a second action (HUD button, second tap, or Enter / Space).
5. Guest win: `sub` match. Auth0 win: JWKS signature + `sub` match.
6. Wrong claim: short fail, keep hunting.

## Stack

- Next.js App Router + TypeScript + pnpm
- Phaser 3 (client-only; never SSR'd)
- `@auth0/nextjs-auth0` v4 (kept in the repo; optional)
- shadcn-style / Tailwind chrome around the canvas
- Vercel-ready

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The game is playable with zero Auth0 env.

```bash
pnpm build
```

## Auth0 app setup (optional)

Create a **Regular Web Application** in the [Auth0 Dashboard](https://manage.auth0.com) if you want the signed-in needle.

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

The SDK still mounts `/auth/login`, `/auth/callback`, `/auth/logout`, and `/auth/profile` via `proxy.ts` when those env vars are set.

## Phaser + Next.js

Phaser needs `window`. This app loads the game with `next/dynamic(..., { ssr: false })` and a dynamic `import()` of `Phaser.Game` inside a client `useEffect`. That is enough to keep `pnpm build` from evaluating Phaser on the server.

## Controls

- **WASD** or arrow keys — walk (desktop)
- **On-screen pad** — walk (phone)
- **First tap** — inspect (sticky decode HUD)
- **Second tap** or **Claim this token** — claim
- **Enter / Space** — claim the inspected chip (or inspect nearest)
