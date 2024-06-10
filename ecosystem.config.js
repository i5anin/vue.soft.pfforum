module.exports = {
  apps: [
    {
      name: 'backend soft',
      script: 'node',
      args: 'backend/build/app.js', // предполагается, что ваш бэкенд собран в папку backend/build
      watch: ['backend/build'],
      ignore_watch: ['node_modules'],
      env: {
        PM2_PUBLIC_KEY: process.env.PM2_PUBLIC_KEY,
        PM2_SECRET_KEY: process.env.PM2_SECRET_KEY,
        NODE_ENV: process.env.NODE_ENV,
      },
      instances: 1,
      exec_mode: 'fork', // Используйте режим fork для backend
    },
    {
      name: 'frontend soft',
      script: 'serve',
      args: '-s dist -l 3000', // указываем папку dist и порт 3000
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork', // Для фронтенда также можно использовать fork
      env: {
        PM2_PUBLIC_KEY: process.env.PM2_PUBLIC_KEY,
        PM2_SECRET_KEY: process.env.PM2_SECRET_KEY,
        NODE_ENV: process.env.NODE_ENV,
      },
    },
  ],
}
