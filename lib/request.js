/* Request handler for Restt-CLI */

// Import the required packages
const https = require('https');

// Import the required modules from Restt-CLI
const log = require('./log');

// Create a request
module.exports = (options) => new Promise((resolve) => {

  // if we have a multipart request then handle it
  if (options.multipart) {

    // Prepare the multipart
    multipart = generateMultipart(options.body);

    // Set the new body and headers
    options.body = multipart.body;
    options.headers['Content-Type'] = multipart.headers['Content-Type'];
    options.headers['Content-Length'] = multipart.headers['Content-Length'];
  }

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

  // Send a payload to the server if there is one
  if (options.body) req.write(options.body);

  // End the request
  req.end();
});

// Generate a multipart upload
const generateMultipart = (body) => {

  // Generate a boundary
  let boundary =  '--------------------------';

  // Generate a boundary using the standard algorithm
  for (var i = 0; i < 24; i++) boundary += Math.floor(Math.random() * 10).toString(16);

  // Create an empty array to become the payload data
  const payload = [];

  // Iterate through each of the keys in the data
  for (const part of Object.keys(body)) {

    // Check if working with a file buffer
    if (body[part] instanceof Buffer) {

      // Add the content to the body (file)
      payload.push(Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="${part}"\r\n`),
        Buffer.from(`Content-Type: application/octet-stream\r\n\r\n`),
        Buffer.from(body[part]),
        Buffer.from(`\r\n\r\n`)
      ]));

    } else {

      // Add the regular fields (non file)
      payload.push(Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="${part}"\r\n\r\n`),
        Buffer.from(body[part]),
        Buffer.from(`\r\n\r\n`)
      ]));
    }
  }

  // Add the final closing tag
  payload.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  // Rerturn the multipart upload data and headers
  return {
    body: Buffer.concat(payload),
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.concat(payload).toString('utf8').length
    }
  }

}