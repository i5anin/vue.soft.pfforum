const os = require('os')

const getLocalIp = () => {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // This will ensure that the IP address is from the local network and not an internal (localhost) address
      if (net.family === 'IPv4' && !net.internal && net.address.startsWith('192.168.')) {
        return net.address
      }
    }
  }
  throw new Error('Локальный IP-адрес не найден.')
}

const getDatabaseInfo = () => {
  const nets = os.networkInterfaces()
  let databaseType = 'test' // Default to test

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal && net.address.startsWith('192.168.')) {
        if (net.address === '192.168.0.10') {
          databaseType = 'production'
        }
        return { localIp: net.address, databaseType }
      }
    }
  }
  throw new Error('Локальный IP-адрес не найден.')
}

module.exports = { getLocalIp, getDatabaseInfo }
