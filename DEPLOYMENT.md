# Rakeen production deployment

This project is configured to run on Render as one Node web service. The
Express process serves `/api/*` and the built React SPA from the same service,
so browser sessions stay first-party and no separate frontend proxy is needed.

## Render

The repository includes `render.yaml`. In Render, create a Blueprint from the
repository and use that file, or create the service manually with these exact
values:

- **Runtime:** Node
- **Build command:** `pnpm install --frozen-lockfile && pnpm run build`
- **Start command:** `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- **Health check path:** `/api/healthz`
- **Node version:** 20 or newer

The Blueprint creates a PostgreSQL database named `rakeen-db` and connects its
connection string to `DATABASE_URL`.

Required environment variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Render PostgreSQL internal connection string |
| `SESSION_SECRET` | A long random value; the Blueprint generates one |
| `CORS_ORIGINS` | `https://rakeen.online,https://www.rakeen.online` |
| `FRONTEND_DIST` | `/opt/render/project/src/artifacts/rakeen/dist/public` |

Do not commit `.env` files or database credentials. Render's generated
`SESSION_SECRET` is preferable to reusing a development secret.

## Database initialization

After the first Render deploy, apply the Drizzle schema against the Render
database from a trusted environment:

```bash
DATABASE_URL='your-render-internal-or-external-connection-string' \
  pnpm --filter @workspace/db run push
```

Do not run schema changes from the web service startup command. Back up the
database before future schema changes.

## Namecheap: `rakeen.online`

1. In Render, open the `rakeen` service, choose **Settings → Custom Domains**,
   and add both `rakeen.online` and `www.rakeen.online`.
2. In Namecheap, open **Domain List → Manage → Advanced DNS**.
3. Remove conflicting parking or URL Redirect records.
4. Add the records Render displays for the custom domain. For the normal
   Render setup this is:

   - **A**, host `@`, value `216.24.57.1`, TTL `Automatic`
   - **CNAME**, host `www`, value `<your-render-service>.onrender.com`, TTL
     `Automatic`

   Use the exact target shown by Render if it differs. Do not add a CNAME for
   the root `@` host when Namecheap's DNS editor does not support it.
5. Wait for DNS propagation, then click **Verify** in Render.
6. Set the canonical redirect you prefer in Render. If the apex domain is
   canonical, redirect `www` to `https://rakeen.online`; otherwise redirect the
   apex to `https://www.rakeen.online`.

Render provisions and renews HTTPS certificates after DNS verification. Test
both:

```bash
curl -I https://rakeen.online/
curl -i https://rakeen.online/api/healthz
```

The health endpoint must return JSON with `"status":"ok"`, and the root must
return the Rakeen SPA. Also test registration, login, logout, transaction
creation, payment, broker transfer, and a refresh of a nested SPA URL.

## Modified files

- `artifacts/api-server/package.json`, `pnpm-lock.yaml`: add the PostgreSQL
  session adapter, its types, and Helmet.
- `artifacts/api-server/src/app.ts`: require secrets, use PostgreSQL sessions,
  secure cookies, bounded request bodies, security headers, API 404 handling,
  SPA static serving, and production error handling.
- `artifacts/api-server/src/lib/route-params.ts`,
  `artifacts/api-server/src/lib/validation.ts`: validate IDs and input values
  at the API boundary.
- `artifacts/api-server/src/routes/auth.ts`: validate credentials and rotate
  sessions on login/registration.
- `artifacts/api-server/src/routes/brokers.ts`: validate broker IDs and avoid
  duplicate broker records.
- `artifacts/api-server/src/routes/messages.ts`: scope reads and writes to
  transaction participants.
- `artifacts/api-server/src/routes/transactions.ts`: validate and authorize
  transaction operations, respect the chosen broker, and implement the
  declared broker-to-seller transfer route.
- `artifacts/api-server/src/routes/wallet.ts`: validate money values and make
  balance changes atomic.
- `artifacts/rakeen/vite.config.ts`,
  `artifacts/mockup-sandbox/vite.config.ts`: provide CI-safe defaults while
  retaining workflow-provided ports and base paths.
- `package.json`: pin pnpm and require a supported Node runtime.
- `render.yaml`: define the Render web service, PostgreSQL database, health
  check, build/start commands, and production variables.
- `DEPLOYMENT.md`: document Render, database, DNS, HTTPS, testing, and file
  changes.