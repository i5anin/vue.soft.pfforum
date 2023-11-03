module.exports = {
  apps: [
    {
      name: 'soft.vue.pf-forum',
      script: 'npm',
      args: 'run serve',
      env: {
        PM2_PUBLIC_KEY: process.env.PM2_PUBLIC_KEY,
        PM2_SECRET_KEY: process.env.PM2_SECRET_KEY
      }
    },
    {
      name: 'backend.soft.vue.pf-forum',
      script: 'backend/server.js',
      args: 'run server',
      env: {
        PM2_PUBLIC_KEY: process.env.PM2_PUBLIC_KEY,
        PM2_SECRET_KEY: process.env.PM2_SECRET_KEY
      }
    }
  ]
};
