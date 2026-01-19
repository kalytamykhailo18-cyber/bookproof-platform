/**
 * PM2 Ecosystem Configuration
 * For production deployment on Hostinger VPS
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart all
 *   pm2 logs
 */

module.exports = {
  apps: [
    {
      name: 'bookproof-backend',
      cwd: './backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
    {
      name: 'bookproof-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      // Graceful shutdown
      kill_timeout: 5000,
    },
  ],
};
