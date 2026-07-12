module.exports = {
  apps: [
    {
      name: 'caption-worker',
      script: './worker/dist/worker/index.js',
      cwd: '/home/nayabsarfaraj/captions',
      env: {
        NODE_ENV: 'production',
      },
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/caption-worker/error.log',
      out_file: '/var/log/caption-worker/out.log',
      merge_logs: true,
    },
    {
      // Next.js as a persistent server (next start), not Vercel serverless —
      // the SSE progress route holds a connection open for up to 10 minutes
      // (app/api/jobs/[id]/stream/route.ts), which exceeds Vercel Hobby's
      // 60s function timeout. Running it here avoids that mismatch entirely.
      name: 'caption-web',
      script: 'npm',
      args: 'start',
      cwd: '/home/nayabsarfaraj/captions',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/caption-web/error.log',
      out_file: '/var/log/caption-web/out.log',
      merge_logs: true,
    },
  ],
}
