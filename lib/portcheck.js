/* Portchecker for Restt-CLI */

// Import the required packages
const net = require('net');

// Create a server and test whether a port is availabile
module.exports = (port) => new Promise((resolve, reject) => {

  // Create a service
  const service = net.createServer();

  // Start the service instance on the port
  const instance = service.listen(port);

  // Check the service for errors and handle them
  instance.on('error', (error) => {

    // Catch the port in use error and reject
    if (error.code == 'EADDRINUSE') reject(`Another process is running on port ::${port} - please close this and try again`);
    
    // Reject with a standard error
    reject(error);
  });

  // Start listening and close the service successfully (no service on this port)
  instance.on('listening', () => instance.close(() => resolve()));
  
});