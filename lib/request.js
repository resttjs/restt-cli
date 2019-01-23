/* Request handler for Restt-CLI */

// Import the required packages
const https = require('https');

// Import the required modules from Restt-CLI
const log = require('./log');

// Create a request
module.exports = (options) => new Promise((resolve) => {

  // Create a request using node https
  const req = https.request(options, (res) => {
    
    // Create a list of chunks
    let data = '';
  
    // Add the data to the chunks
    res.on('data', (d) => data += d);

    // Return the parse data after completion
    res.on('end', () => resolve(JSON.parse(data)));
  
  });
  
  // Output the errors to the console
  req.on('error', (error) => log({
    description: error,
    type: 'error',
    label: false
  }));

  // Send a binary file to the server if there is one
  if (options.binary) req.write(options.binary);

  // End the request
  req.end();
});