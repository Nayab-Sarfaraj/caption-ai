const path = require('path')

module.exports = {
  apps: [
    {
      name: 'caption-worker',
      script: './worker/dist/worker/index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: path.join(__dirname, 'logs', 'worker-error.log'),
      out_file: path.join(__dirname, 'logs', 'worker-out.log'),
      merge_logs: true,
    },
  ],
}
