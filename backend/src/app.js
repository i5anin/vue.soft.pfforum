require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const routers = require('./routers');
const os = require('os');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/api', routers);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send({
    status: err.status || 500,
    message: err.message || 'Произошла ошибка на сервере',
  });
});

const getLocalIp = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal && net.address.startsWith('192.168.')) {
        return net.address;
      }
    }
  }
  throw new Error('Локальный IP-адрес не найден.');
};

const localIp = getLocalIp();

app.listen(config.port, localIp, () => {
  console.log(`DB connect http://${config.dbConfig.host}:${config.dbConfig.port}`);
  console.log(`Server is running on http://${localIp}:${config.server.port}`);
});
