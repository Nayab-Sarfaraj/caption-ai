# Production Deployment Guide

This is the current target production architecture for Instacap. It replaces
the older single-GCP-VM deployment described in `docs/vm-setup.md`.

## Architecture

```
Browser
  │
  ├── Next.js app and API routes ── Vercel
  │       │
  │       ├── MongoDB Atlas       (jobs and users)
  │       ├── Upstash Redis       (BullMQ queue and progress pub/sub)
  │       └── Cloudflare R2       (original videos, transcripts, final MP4s)
  │
  └── EC2 worker ── BullMQ consumer
          ├── Deepgram transcription
          ├── AWS Remotion Lambda rendering
          │       └── temporary Remotion S3 bucket only
          └── uploads final MP4 back to Cloudflare R2
```

Cloudflare R2 remains the permanent storage system. Remotion Lambda uses its
own AWS bucket only while a video is rendering; the worker downloads the result
and stores the final file in R2.

## Before starting

- Rotate any credential that was exposed in a terminal, screenshot, chat, or
  commit.
- Keep `.env`, `.env.local`, and `worker/.env` out of Git. They are ignored by
  this repository.
- Choose one AWS region and use it consistently for the Remotion function,
  Remotion site, and `REMOTION_AWS_REGION`. This guide uses `us-east-1`.
- Do not shut down the existing GCP deployment until the Vercel app and worker
  have passed the smoke test below.

## 1. Deploy Remotion Lambda

Run these commands on a trusted administrator machine, not on Vercel. Remotion
requires AWS credentials as environment variables in the shell. If AWS CLI SSO
is used, first log in and export the current profile's temporary credentials:

```powershell
aws sso login --profile YOUR_PROFILE
aws configure export-credentials --profile YOUR_PROFILE --format powershell | Invoke-Expression
$env:AWS_REGION = 'us-east-1'
$env:AWS_DEFAULT_REGION = 'us-east-1'
```

Confirm the AWS identity before provisioning resources:

```powershell
aws sts get-caller-identity
```

From the repository root, deploy the renderer function and the Remotion site:

```powershell
npx remotion lambda functions deploy --arch=arm64 --memory=2048
npx remotion lambda sites create remotion/Root.tsx --site-name=caption-ai
```

Record the output values:

- `REMOTION_LAMBDA_FUNCTION_NAME`: the value after `Deployed as`.
- `REMOTION_LAMBDA_SERVE_URL`: the full value after `Serve URL`, including
  `index.html`.
- `REMOTION_AWS_REGION`: `us-east-1` for the commands above.

`REMOTION_LAMBDA_SERVE_URL` must be the full S3 URL. Do not use `caption-ai`,
or any other site name, in its place.

Redeploy the Remotion site every time files under `remotion/` change:

```powershell
npx remotion lambda sites create remotion/Root.tsx --site-name=caption-ai
```

## 2. Deploy the web app to Vercel

Import the Git repository into Vercel and configure the Production environment
from `.env.example`. The web app needs the Clerk, MongoDB, Upstash, R2,
Deepgram, Groq (optional, for News Bar headline suggestions), Polar, PostHog,
and `NEXT_PUBLIC_APP_URL` variables.

The web app does **not** need the AWS/Remotion Lambda credentials because it
does not render videos itself.

To enable the optional News Bar suggestion button, set `GROQ_API_KEY` in
Vercel's server-side Production environment. Do not use a `NEXT_PUBLIC_`
prefix and do not add this key to the EC2 worker environment.

Set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain, then deploy. Confirm these
routes work before changing DNS:

- Sign in and open the dashboard.
- Create an upload URL.
- Receive a Clerk webhook.
- Load an existing job.

Add the production domain in Vercel. Then update the Cloudflare DNS record to
the target supplied by Vercel. Keep Cloudflare proxying enabled only if Vercel
and the configured SSL mode support it correctly.

## 3. Provision the worker host

Use an Ubuntu 24.04 EC2 instance for the dedicated `caption-worker` process.
The worker does transcription, queue consumption, R2 transfer, and the Lambda
render polling; it does not host the Next.js web app.

Install Node.js 20, Git, and PM2:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2
```

Clone the repository, install dependencies, and build the worker:

```bash
git clone <your-repository-url> /home/ubuntu/caption-ai
cd /home/ubuntu/caption-ai
npm ci
npm run worker:build
```

Create the worker environment file with restricted permissions:

```bash
cp worker/.env.example worker/.env
chmod 600 worker/.env
nano worker/.env
```

The worker requires the shared backend values plus the Lambda values:

```env
MONGO_URI=
UPSTASH_REDIS_URL=
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
DEEPGRAM_API_KEY=
TRANSCRIPTION_PROVIDER=deepgram
DISCORD_WEBHOOK_URL=

REMOTION_LAMBDA_FUNCTION_NAME=
REMOTION_LAMBDA_SERVE_URL=
REMOTION_AWS_REGION=us-east-1
REMOTION_LAMBDA_CONCURRENCY=6
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
```

`AWS_SESSION_TOKEN` is required only when the AWS credentials are temporary
(for example, AWS SSO credentials). The current Remotion client requires these
AWS values in the worker environment; a local AWS CLI login does not transfer to
EC2 automatically.

`REMOTION_LAMBDA_CONCURRENCY=6` is a conservative starting point for a new AWS
account that may have a Lambda concurrency limit of 10. Increase it only after
checking the quota with `npx remotion lambda quotas`.

### Render frame-rate policy

The worker keeps the stored upload width and height unchanged. Before each
render, it reads the uploaded MP4/MOV's actual frame timestamps from R2:

- Source videos at 30fps or below keep their source frame rate.
- 50fps inputs render at 25fps.
- 60fps inputs render at 30fps.
- If frame-rate detection cannot read the input, the worker safely falls back
  to the queued frame rate (currently 30fps).

This lowers Lambda work for high-frame-rate uploads without resizing the video.

Rendered videos include a one-second buffer after the final transcribed word.

Start and persist the worker:

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup` to enable restart after a reboot.

## 4. Cut over from the current GCP VM

The existing GCP VM can continue to run temporarily while the new stack is
tested. BullMQ will not process one queue job twice, but leaving both workers
running increases render concurrency and makes the cutover harder to observe.
Stop the old worker once EC2 has passed the smoke test.

Once the EC2 worker is healthy and Vercel is serving the production domain:

1. Stop only the old `caption-worker` on GCP.
2. Confirm new uploads are processed by EC2.
3. Stop the old `caption-web` only after DNS resolves to Vercel and the site is
   working normally.

## 5. Smoke test

Run this in order after deployment:

1. Upload a short MP4 and verify the original appears in Cloudflare R2.
2. Verify the job reaches `transcript_ready`.
3. Export the job and watch EC2 worker logs:

   ```bash
   pm2 logs caption-worker --lines 100
   ```

4. Confirm the log reports a Lambda render, not local rendering.
5. Confirm progress is visible in the browser.
6. Download the completed MP4 and verify the final object is in R2.
7. Confirm a failed job reports a safe user-facing error and can be retried.

## Deploying updates

### Web-only changes

Push the branch to the repository. Vercel builds and deploys it. Validate the
Vercel deployment before promoting it to production.

### Worker changes

On EC2:

```bash
cd /home/ubuntu/caption-ai
git pull origin main
npm ci
npm run worker:build
pm2 restart caption-worker --update-env
```

### Remotion composition changes

Deploy both the worker code and the Remotion site:

```powershell
npx remotion lambda sites create remotion/Root.tsx --site-name=caption-ai
```

The site command can overwrite the existing site name. The worker continues to
use the same `REMOTION_LAMBDA_SERVE_URL` when the site name and AWS region stay
the same.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Lambda says the site is not a Remotion project | `REMOTION_LAMBDA_SERVE_URL` is a placeholder or site name | Use the full `Serve URL` output from the site deployment. |
| Lambda credentials missing | AWS CLI login is not available to the process | Set AWS keys (and session token if applicable) in `worker/.env`. |
| Jobs remain queued | Worker cannot reach Upstash Redis or is offline | Check `pm2 logs caption-worker` and `UPSTASH_REDIS_URL`. |
| Render completes but download fails | Worker cannot upload to R2 | Check the R2 account ID, bucket, and credentials. |
| Site is online but job progress stops | Worker, Redis pub/sub, or polling fallback is unavailable | Check the worker logs and `/api/jobs/<id>` response. |

## Legacy documentation

`docs/vm-setup.md` documents the former single-GCP-VM deployment. Keep it only
as a rollback reference; use this guide for the Vercel + EC2 + Lambda setup.
