const os = require('os')

const getNetworkDetails = () => {
  const nets = os.networkInterfaces()
  let localIp = ''
  let databaseType = 'test' // Default to test

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Ensure the IP address is from the local network and not an internal (localhost) address
      if (net.family === 'IPv4' && !net.internal && net.address.startsWith('192.168.')) {
        localIp = net.address
        // Check if the IP address is the production database IP
        if (localIp === '192.168.0.10') {
          databaseType = 'production'
        }
        // Return as soon as we find the first matching IP address
        return { databaseType } // "databaseType": "test"
      }
    }
  }

  if (!localIp) {
    throw new Error('Локальный IP-адрес не найден.')
  }
}

module.exports = { getNetworkDetails }
