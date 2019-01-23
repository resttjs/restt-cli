/* Portchecker for Restt-CLI */

// Import the required packages
const net = require('net');

// Create a server and test whether a port is availabile
module.exports = (port, success, failure) => {

  // Create a service
  const service = net.createServer()
  
  // Check the service for errors and handle them
  service.once('error', (error) => {
    if (error.code == 'EADDRINUSE') return failure(`Another process is running on port ::${port} - please close this and try again`);
    return failure(error);
  });

  service.once('listening', () => {
    instance.close(() => {
      success();
    })
  })
  
  // Start the service instance
  const instance = service.listen(port);
}