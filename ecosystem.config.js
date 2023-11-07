module.exports = {
  apps: [
    {
      name: 'backend soft',
      script: 'backend/src/app.js',
      watch: true,
      env: {
        // Ваши переменные окружения для бэкенда
        PM2_PUBLIC_KEY: process.env.PM2_PUBLIC_KEY,
        PM2_SECRET_KEY: process.env.PM2_SECRET_KEY,
        // Другие переменные окружения
      },
      instances: 1,
      exec_mode: 'cluster',
    },
    {
      name: 'frontend soft',
      script: 'npx', // Используйте npx для запуска локальных пакетов
      args: 'vite --host',
      // interpreter: 'none',
      watch: true,
      env: {
        // Ваши переменные окружения для фронтенда
        PM2_PUBLIC_KEY: process.env.PM2_PUBLIC_KEY,
        PM2_SECRET_KEY: process.env.PM2_SECRET_KEY,
        // Другие переменные окружения
      },
    },
  ],
};
