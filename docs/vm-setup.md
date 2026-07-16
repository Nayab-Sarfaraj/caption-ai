# GCP VM Setup — Hypecap (Next.js app + worker, same VM)

Both processes run here, not just the worker. Next.js is NOT deployed to
Vercel — its SSE progress route (`app/api/jobs/[id]/stream/route.ts`) holds a
connection open for up to 10 minutes, which exceeds Vercel Hobby's 60s
serverless function timeout. Running `next start` as a persistent process here
avoids that mismatch entirely, and matches CLAUDE.md's stated flexibility
("Next.js app — deployable anywhere: Vercel or the same GCP VM").

## 1. Create VM

- Machine: `e2-standard-2` (2 vCPU, 8 GB RAM) minimum — this is running two
  Node processes now, not one; if render concurrency or traffic grows,
  `e2-standard-4` is the next step up, not a bigger e2-standard-2.
- OS: Ubuntu 22.04 LTS
- Disk: 50 GB SSD (rendered videos use /tmp, but bundle cache + node_modules need space)
- Region: choose closest to majority of users
- Firewall: allow HTTP (80) and HTTPS (443) — needed for nginx in step 11, not just the default SSH rule

## 2. Install system dependencies

```bash
sudo apt-get update && sudo apt-get install -y \
  ca-certificates curl fonts-liberation libasound2 libatk-bridge2.0-0 \
  libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
  libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 \
  libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
  libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
  libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
  lsb-release wget xdg-utils
```

No `ffmpeg` in this list — Remotion 4.0+ bundles it and auto-downloads into
`node_modules` at render time if missing, system ffmpeg isn't required. (If
you already ran an earlier version of this command with ffmpeg included,
that's harmless, just unnecessary — no need to uninstall it.)

These are shared libs for Remotion's bundled Chromium (not system Chromium).

## 3. Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # should be v20.x
```

## 4. Install pm2

```bash
sudo npm install -g pm2
pm2 startup systemd  # follow the printed command to enable pm2 on boot
```

## 5. Clone repo + install deps

```bash
git clone <your-repo-url> /home/ubuntu/captions
cd /home/ubuntu/captions
npm install
```

## 6. Configure worker environment

```bash
cp worker/.env.example worker/.env
nano worker/.env  # fill in all values
```

Required vars (worker only touches these — no Clerk/Polar, that's Next.js-side):
```
MONGO_URI=
UPSTASH_REDIS_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
CLOUDFLARE_ACCOUNT_ID=
DEEPGRAM_API_KEY=
TRANSCRIPTION_PROVIDER=deepgram
```

## 7. Configure Next.js environment

```bash
cp .env.example .env.local
nano .env.local  # fill in all values
```

Every var in `.env.example` — Clerk, Mongo, Redis, R2, Deepgram, Polar, and
`NEXT_PUBLIC_APP_URL` (set this to the real public domain, not localhost —
it's used for the Polar checkout `successUrl` and other absolute-URL construction).

## 8. Build worker TypeScript

```bash
npm run worker:build
# runs tsc, then tsc-alias to rewrite @/ path aliases to relative requires
# (tsc's "paths" only affects type-checking — Node can't resolve @/ at
# runtime with plain tsc output, so the shared /src files import errors
# with MODULE_NOT_FOUND without this rewrite step)
# output in worker/dist/worker/index.js
```

## 9. Build Next.js

```bash
npm run build
# output in .next/ — this is what `npm start` (next start) serves
```

## 10. Create log directories

```bash
sudo mkdir -p /var/log/caption-worker /var/log/caption-web
sudo chown ubuntu:ubuntu /var/log/caption-worker /var/log/caption-web
```

## 11. nginx reverse proxy + SSL

Next.js listens on `localhost:3000` (see `ecosystem.config.js`) — nginx sits
in front on 80/443 and terminates SSL, so the SSE route and everything else
is reachable on your real domain instead of `:3000` directly.

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

`/etc/nginx/sites-available/captions`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # SSE route holds connections open for up to 10 minutes — nginx's
        # default proxy_read_timeout (60s) will silently kill it otherwise,
        # same class of problem as the Vercel Hobby timeout this setup exists
        # to avoid. Must be longer than MAX_STREAM_DURATION_MS in
        # app/api/jobs/[id]/stream/route.ts.
        proxy_read_timeout 660s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/captions /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com   # sets up SSL, auto-configures the 443 server block
```

## 12. Start both processes with pm2

```bash
pm2 start ecosystem.config.js
pm2 save  # persist across reboots
```

## 13. Verify

```bash
pm2 logs caption-worker --lines 50
# Should see: [worker] MongoDB connected
# Should see: [worker] listening on queue "render"

pm2 logs caption-web --lines 50
# Should see: Next.js production server ready on port 3000

curl -I https://your-domain.com
# Should return 200/307 (redirect to sign-in), not a connection error
```

## 14. Reconfigure webhooks for the real domain

Clerk and Polar both send webhooks to a public URL — neither could reach
`localhost` during dev, which is why user sync and billing sync never worked
locally. This step is what actually turns them on for the first time.

**Clerk** (dashboard → Webhooks → Add Endpoint):
- URL: `https://your-domain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`
- Copy the signing secret into `CLERK_WEBHOOK_SECRET` in `.env.local` on the VM
  — replace the `whsec_FIXME_placeholder...` value if it's still there from
  local dev, then `pm2 restart caption-web`.

**Polar** (dashboard → Settings → Webhooks):
- URL: `https://your-domain.com/api/webhooks/polar`
- Events: `subscription.created`, `subscription.active`, `subscription.updated`, `subscription.canceled`, `subscription.uncanceled`, `subscription.revoked`, `subscription.past_due`
- Copy the signing secret into `POLAR_WEBHOOK_SECRET`, switch `POLAR_SERVER` to
  `production` and `POLAR_ACCESS_TOKEN` to a production organization token
  (not sandbox), confirm `POLAR_PRODUCT_ID` refers to a Product created in the
  production org — sandbox and production orgs are entirely separate in
  Polar, the sandbox Product ID won't work here.
- `pm2 restart caption-web` after updating.

Verify both: sign up a fresh test account and confirm a `User` document
actually appears in MongoDB (this was silently broken for the whole dev
session before this step — see the muskelon807 account fix for what it looks
like when it isn't wired up).

## Deploying updates

```bash
cd /home/ubuntu/captions
git pull origin main
npm install
npm run worker:build
npm run build
pm2 restart caption-worker caption-web
```

## Disk cleanup

If /tmp fills up (crash left zombie dirs):
```bash
find /tmp -maxdepth 1 -name '[0-9a-f]*' -type d -mmin +60 -exec rm -rf {} +
```

Worker already deletes /tmp/{jobId} in the `finally` block on every job — this is just a manual safety net.
