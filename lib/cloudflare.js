/* Cloudflare functions for Restt-CLI */

// Import the required modules from Restt-CLI
const configuration = require('./configuration');
const fs = require('./fs');
const log = require('./log');
const request = require('./request');

// Upload the worker to cloudflare
module.exports.upload = (script, success) => {

  // Check the configuration variables for cloudflare are all set
  try {

    // Check if the cloudflare key set in the configruation
    if (!configuration.cloudflare) throw('cloudflare');

    // Check if the cloudflare email is set in the configruation
    if (!configuration.cloudflare.email || configuration.cloudflare.email.length == 0) throw('cloudflare.email');

    // Check if the cloudflare authentication key is set in the configruation
    if (!configuration.cloudflare.key || configuration.cloudflare.key.length == 0) throw('cloudflare.key');

    // Check if the cloudflare zone is set in the configruation
    if (!configuration.cloudflare.zone || configuration.cloudflare.zone.length == 0) throw('cloudflare.zone');

  } catch (key) {

    // Log out the errors
    return log({
      description: `Failed to upload the worker script to Cloudflare Workers\n\nMissing key '${key}' in configuration (restt.conf.json)\n`,
      type: 'error',
      clear: true
    });
  }

  // Create a request to upload the cloudflare worker
  const req = request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${configuration.cloudflare.zone}/workers/script`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/javascript',
        'X-Auth-Email': configuration.cloudflare.email,
        'X-Auth-Key': configuration.cloudflare.key
      },
      binary: fs.readBuffer(script)
    });
  
  // Process the response from the upload
  req.then((response) => {

    // Check if we have any errors
    if (response.success) {
      
      // Log out the success message
      log({
        description: `Successfully deployed the worker script to Cloudflare Workers`,
        type: 'success',
        clear: true
      });

      // Call the success callback
      return success(true);

    } else {

      // Format the errors
      const errors = `CloudflareError: ${response.errors.map(({ message }) => message).join('\nCloudflareError:')}`;

      // Log out the errors
      return log({
        description: `Failed to upload the worker script to Cloudflare Workers\n\n${errors}`,
        type: 'error',
        clear: true
      });
    }

  });

  return req;
}

// Create a workerskv namespace on cloudflare (from and index and loop, or just one name)
const createNamespace = (indexOrNamespace) => {

  // Check if we have an index or name
  const index = (typeof indexOrNamespace == 'number') ? indexOrNamespace : false;

  // Fetch the namespace from an index if applicable (or leave as a string)
  const namespace = (index) ? configuration.workerskv.namespaces[index] : indexOrNamespace;

  // If there is an index then fetch the total number of namespaces
  const length = (configuration.workerskv && configuration.workerskv.namespaces) ? (configuration.workerskv.namespace.length - 1) : 0;

  // Create a request to create the workerskv namespace
  const req = request({
    hostname: 'api.cloudflare.com',
    path: `/client/v4/accounts/${configuration.cloudflare.account}/storage/kv/namespaces`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/javascript',
      'X-Auth-Email': configuration.cloudflare.email,
      'X-Auth-Key': configuration.cloudflare.key
    },
    body: {
      title: namespace.toUpperCase()
    }
  });

  // Process the response from the namespace creation
  req.then((response) => {

    // Check if we have any errors
    if (response.success) {
      
      // Return and log out the success message (for the last case)
      if (index == length) return log({
        description: `Successfully created WorkersKV Namespaces on Cloudflare`,
        type: 'success',
        clear: true
      });

      // Check if there is another namespace and create it on cloudflare
      if (index < length) createNamespace(index + 1);

    } else {

      // Format the errors
      const errors = `CloudflareError: ${response.errors.map(({ message }) => message).join('\nCloudflareError:')}`;

      // Log out the errors
      return log({
        description: `Failed to create WorkersKV Namespaces on Cloudflare\n\n${errors}`,
        type: 'error',
        clear: true
      });
    }

  });

}

// Create the required namespaces on cloudflare
module.exports.createNamespaces = (script) => {

  // Check the configuration variables for cloudflare are all set
  try {

    // Check if the cloudflare key set in the configruation
    if (!configuration.cloudflare) throw('cloudflare');

    // Check if the cloudflare email is set in the configruation
    if (!configuration.cloudflare.email || configuration.cloudflare.email.length == 0) throw('cloudflare.email');

    // Check if the cloudflare authentication key is set in the configruation
    if (!configuration.cloudflare.key || configuration.cloudflare.key.length == 0) throw('cloudflare.key');

    // Check if the cloudflare zone is set in the configruation
    if (!configuration.cloudflare.zone || configuration.cloudflare.zone.length == 0) throw('cloudflare.zone');

    // Check if we have any namespaces set
    if (configuration.workerskv && configuration.workerskv.namespaces && configuration.workerskv.namespaces) {

      // Check if the cloudflare account is set in the configruation
      if (!configuration.cloudflare.account || configuration.cloudflare.account.length == 0) throw('cloudflare.account');
    }

  } catch (key) {

    // Log out the errors
    return log({
      description: `Failed to create WorkersKV Namespaces on Cloudflare\n\nMissing key '${key}' in configuration (restt.conf.json)\n`,
      type: 'error',
      clear: true
    });
  }

  // Create the first namespace (loop through all other namespaces)
  createNamespace(0);
}