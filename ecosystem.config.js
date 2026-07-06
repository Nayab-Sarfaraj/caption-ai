module.exports = {
  apps: [
    {
      name: 'caption-worker',
      script: './worker/dist/index.js',
      cwd: '/home/ubuntu/captions',
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
  ],
}
