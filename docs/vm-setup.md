# GCP VM Setup — Caption Worker

## 1. Create VM

- Machine: `e2-standard-2` (2 vCPU, 8 GB RAM) minimum
- OS: Ubuntu 22.04 LTS
- Disk: 50 GB SSD (rendered videos use /tmp, but bundle cache + node_modules need space)
- Region: choose closest to majority of users

## 2. Install system dependencies

```bash
sudo apt-get update && sudo apt-get install -y \
  ca-certificates curl fonts-liberation libasound2 libatk-bridge2.0-0 \
  libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
  libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 \
  libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
  libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
  libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
  lsb-release wget xdg-utils ffmpeg
```

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

Required vars:
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

## 7. Build worker TypeScript

```bash
npx tsc --project worker/tsconfig.json
# output in worker/dist/
```

## 8. Create log directory

```bash
sudo mkdir -p /var/log/caption-worker
sudo chown ubuntu:ubuntu /var/log/caption-worker
```

## 9. Start worker with pm2

```bash
pm2 start ecosystem.config.js
pm2 save  # persist across reboots
```

## 10. Verify

```bash
pm2 logs caption-worker --lines 50
# Should see: [worker] MongoDB connected
# Should see: [worker] listening on queue "render"
```

## Deploying updates

```bash
cd /home/ubuntu/captions
git pull origin main
npm install
npx tsc --project worker/tsconfig.json
pm2 restart caption-worker
```

## Disk cleanup

If /tmp fills up (crash left zombie dirs):
```bash
find /tmp -maxdepth 1 -name '[0-9a-f]*' -type d -mmin +60 -exec rm -rf {} +
```

Worker already deletes /tmp/{jobId} in the `finally` block on every job — this is just a manual safety net.
