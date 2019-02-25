/* Cloudflare functions for Restt-CLI */

// Import the required modules from Restt-CLI
const configuration = require('./configuration').production;
const fs = require('./fs');
const log = require('./log');
const request = require('./request');

// Upload the worker to cloudflare
module.exports.upload = (worker) => {

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

    // Check if the cloudflare enterprise user has set a script
    if (configuration.cloudflare.enterprise && (!configuration.cloudflare.script || configuration.cloudflare.script.length == 0)) throw('cloudflare.script');

    // Check if there are any routes set
    if (configuration.cloudflare.routes && (!configuration.cloudflare.routes || configuration.cloudflare.routes.length == 0)) throw('cloudflare.routes');

    // Check if there are any namespaces set
    if (configuration.workerskv && configuration.workerskv.namespaces && configuration.workerskv.namespaces.length != 0) {

      // Check if the cloudflare account is set in the configruation
      if (!configuration.cloudflare.account || configuration.cloudflare.account.length == 0) throw('cloudflare.account');
    }

  } catch (key) {

    // Log out the errors
    return log({
      description: `Failed to upload the worker script to Cloudflare Workers\n\nMissing key '${key}' in configuration (restt.conf.json)\n`,
      type: 'error',
      clear: true
    });
  }

  // Create all of the routes on cloudflare
  createRoutes().then(response => {

    // If there are any have WorkersKV namespaces
    if (configuration.workerskv && configuration.workerskv.namespaces && configuration.workerskv.namespaces.length > 0) {

      // Performs a fetch of namespaces
      fetchNamespaceBindings().then(bindings => {

        // Upload the worker with the bindings
        uploadWorker(worker, bindings, configuration.cloudflare.script);
      });

      // deleteNamespace('eec627a013bb41cca1c7faf4fa9dcc67');

    } else {

      // Upload the worker without any bindings
      uploadWorker(worker, [], configuration.cloudflare.script);
    }

  });
}

// Upload workers to cloudflare
const uploadWorker = (worker, bindings, script) => {

  // Define the endpoint for uploading a worker
  let endpoint = `/client/v4/zones/${configuration.cloudflare.zone}/workers/script`;

  // If enterprise and using a worker then append it to the endpoint
  if (configuration.cloudflare.enterprise && script && script.length > 0) endpoint += `s/${script}`;

  // Create a request to upload the cloudflare worker
  const req = request({
    hostname: 'api.cloudflare.com',
    path: endpoint,
    method: 'PUT',
    headers: {
      'X-Auth-Email': configuration.cloudflare.email,
      'X-Auth-Key': configuration.cloudflare.key,
    },
    body: {
      script: fs.readBuffer(worker),
      metadata: JSON.stringify({
        body_part: 'script', 
        bindings: bindings
      })
    },
    multipart: true
  });

  // Process the response from the upload
  req.then(response => {

    // Check if we have any errors
    if (response.success) {
      
      // Log out the success message
      return log({
        description: `Successfully deployed the worker script to Cloudflare Workers`,
        type: 'success',
        clear: true
      });

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
}

// Fetch all of the current namespaces with cloudflare
const fetchNamespaces = () => new Promise(resolve => {

  // Create a request to check the list of workerskv namespaces
  const req = request({
    hostname: 'api.cloudflare.com',
    path: `/client/v4/accounts/${configuration.cloudflare.account}/storage/kv/namespaces`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Email': configuration.cloudflare.email,
      'X-Auth-Key': configuration.cloudflare.key
    }
  });

  // Process the response from list of namespaces
  req.then(response => {

    // Check if we have any errors
    if (response.success) {
      
      // Return the list of namespaces
      resolve(response.result);

    } else {

      // Format the errors
      const errors = `CloudflareError: ${response.errors.map(({ message }) => message).join('\nCloudflareError:')}`;

      // Log out the errors
      resolve(log({
        description: `Failed to fetch namespaces on Cloudflare WorkersKV\n\n${errors}`,
        type: 'error',
        clear: true
      }));
    }

  });

});

// Create a workerskv namespace on cloudflare
const createNamespace = (namespace) => new Promise(resolve => {

  // Create a request to create the workerskv namespace
  const req = request({
    hostname: 'api.cloudflare.com',
    path: `/client/v4/accounts/${configuration.cloudflare.account}/storage/kv/namespaces`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Email': configuration.cloudflare.email,
      'X-Auth-Key': configuration.cloudflare.key
    },
    body: JSON.stringify({
      title: namespace
    })
  });

  // Process the response from the namespace creation
  req.then(response => {

    // Check if we have any errors
    if (response.success) {

      // Log out the success message for the case
      log({
        description: `Successfully created namespace '${namespace}' on Cloudflare WorkersKV`,
        type: 'success',
        clear: true
      });

      // Resolve the namespace
      resolve(response.result);

    } else {

      // Format the errors
      const errors = `CloudflareError: ${response.errors.map(({ message }) => message).join('\nCloudflareError:')}`;

      // Log out the errors
      return log({
        description: `Failed to create namespace '${namespace}' on Cloudflare WorkersKV\n\n${errors}`,
        type: 'error',
        clear: true
      });
    }

  });

});

// Delete a workerskv namespace on cloudflare
const deleteNamespace = (namespace) => new Promise(resolve => {

  // Create a request to delete a workerskv namespace
  const req = request({
    hostname: 'api.cloudflare.com',
    path: `/client/v4/accounts/${configuration.cloudflare.account}/storage/kv/namespaces/${namespace}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Email': configuration.cloudflare.email,
      'X-Auth-Key': configuration.cloudflare.key
    },
    body: JSON.stringify({
      title: namespace
    })
  });

  // Process the response from the namespace deletion
  req.then(response => {

    // Check if we have any errors
    if (response.success) {

      // Log out the success message for the case
      log({
        description: `Successfully deleted namespace '${namespace}' on Cloudflare WorkersKV`,
        type: 'success',
        clear: true
      });

      // Resolve the namespace
      resolve(response.result);

    } else {

      // Format the errors
      const errors = `CloudflareError: ${response.errors.map(({ message }) => message).join('\nCloudflareError:')}`;

      // Log out the errors
      return log({
        description: `Failed to delete namespace '${namespace}' on Cloudflare WorkersKV\n\n${errors}`,
        type: 'error',
        clear: true
      });
    }

  });

});


// Create and bind namespaces
const fetchNamespaceBindings = () => new Promise(resolve => {

  // First fetch all the exisiting namespaces
  fetchNamespaces().then(namespaces => {

    // Create a list of namespaces to be resolved
    const list = [];

    // Iterate through the list of namespaces
    for (const namespace of configuration.workerskv.namespaces) {

      // Find the existing namespace if there is one
      const exists = namespaces.find(({ title }) => title == namespace);

      // Check whether the namespace exists or not and add it to the list
      list.push((!exists) ? createNamespace(namespace) : exists);
    }

    // Resolve a promise of all the namespaces
    return Promise.all(list);

  }).then(namespaces => {

    // Create a list of bindings
    const bindings = [];

    // Iterate through the list of namespaces
    for (const namespace of namespaces) {

      // Add the binding
      bindings.push({ 
        name: namespace.title,
        namespace_id: namespace.id,
        type: 'kv_namespace'
      });
    }

    // Resolve the list of bindings
    resolve(bindings);
  });

});

// Save a route to the configuration for cloudflare use
module.exports.storeRoute = (route) => {

  // Store the origional route
  const origionalRoute = route;

  // Make sure the route ends with a wildcard
  if (route[route.length -1] != '*') route += '/*';

  // Define the path for the configuration file (restt.config.json)
  const resttConfig = fs.path(process.cwd(), 'restt.config.json');

  // Check if there is a restt.config.json
  if (fs.exists(resttConfig)) {

    // Load the restt.config.json from the project
    const configData = fs.readJSON(resttConfig);

    // Check if there are cloudflare routes
    if (configData.cloudflare && configData.cloudflare.routes) {

      // Check if the routes is not an array
      if (!Array.isArray(configuration.cloudflare.routes)) {

        // Check if the route exists in the array or not
        if ((Object.values(configData.cloudflare.routes).indexOf(origionalRoute) == -1) && (Object.values(configData.cloudflare.routes).indexOf(route) == -1)) {

          // Add the new route with a random ID (when the routes is an object)
          configData.cloudflare.routes[`route_${((Math.random() * 10000) * Date.now()).toString(36).slice(0, 6)}`] = route;
        }

      } else {

        // If the route doesn't exist then add it (when the routes are an array)
        if ((configData.cloudflare.routes.indexOf(origionalRoute) == -1) && (configData.cloudflare.routes.indexOf(route) == -1)) configData.cloudflare.routes.push(route);
      }

    } else {

      // Create an array for routes and add this route
      configData.cloudflare.routes = [route];
    }

    // Save the updated file
    fs.writeJSON(resttConfig, configData);
  }

}

// Fetch all of the current routes with cloudflare
const fetchRoutes = () => new Promise(resolve => {

  // Define the endpoint for the routes
  let endpoint = `/client/v4/zones/${configuration.cloudflare.zone}/workers/`;

  // Append to the end dependending on whether enterprise or not
  endpoint += (configuration.cloudflare.enterprise) ? 'routes' : 'filters';

  // Create a request to check the list of worker routes
  const req = request({
    hostname: 'api.cloudflare.com',
    path: endpoint,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Email': configuration.cloudflare.email,
      'X-Auth-Key': configuration.cloudflare.key
    }
  });

  // Process the response from list of routes
  req.then(response => {

    // Check if we have any errors
    if (response.success) {
      
      // Return the list of routes
      resolve(response.result);

    } else {

      // Format the errors
      const errors = `CloudflareError: ${response.errors.map(({ message }) => message).join('\nCloudflareError:')}`;

      // Log out the errors
      resolve(log({
        description: `Failed to fetch routes on Cloudflare\n\n${errors}`,
        type: 'error',
        clear: true
      }));
    }

  });

});

// Create the routes on cloudflare
const createRoutes = () => {

  // return Promise.resolve();

  // First fetch all the exisiting routes
  return fetchRoutes().then(routes => {

    // Create a list of routes to resolve
    const list = [];

    // Check if the routes is an array, and if not map to an array of values
    if (!Array.isArray(configuration.cloudflare.routes)) configuration.cloudflare.routes = Object.values(configuration.cloudflare.routes);

    // Iterate through the list of routes
    for (let route of configuration.cloudflare.routes) {

      // Make sure the route ends with a wildcard
      if (route[route.length -1] != '*') route += '/*';

      // Find the existing route if there is one
      const exists = routes.find(({ pattern }) => pattern == route);

      // Check whether the route exists or not and add to the list
      list.push((!exists) ? createRoute(route) : exists);
    }

    // Resolve a promise of all the routes
    return Promise.all(list);
  });
}

// Create a workerskv namespace on cloudflare
const createRoute = (route) => new Promise(resolve => {

  // Define the endpoint for the routes
  let endpoint = `/client/v4/zones/${configuration.cloudflare.zone}/workers/`;

  // Append to the end dependending on whether enterprise or not
  endpoint += (configuration.cloudflare.enterprise) ? 'routes' : 'filters';

  // Define the payload
  const payload = { pattern: route };
  
  // If enterprise then add the script
  if (configuration.cloudflare.enterprise) payload.script = configuration.cloudflare.script;

  // If not enterprise then add enabled as true
  if (!configuration.cloudflare.enterprise) payload.enabled = true;

  // Create a request to create the workers route
  const req = request({
    hostname: 'api.cloudflare.com',
    path: endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Email': configuration.cloudflare.email,
      'X-Auth-Key': configuration.cloudflare.key
    },
    body: JSON.stringify(payload)
  });

  // Process the response from the namespace creation
  req.then(response => {

    // Check if we have any errors
    if (response.success) {

      // Log out the success message for the case
      log({
        description: `Successfully created route '${route}' on Cloudflare`,
        type: 'success',
        clear: true
      });

      // Resolve the namespace
      resolve(response.result);

    } else {

      // Format the errors
      const errors = `CloudflareError: ${response.errors.map(({ message }) => message).join('\nCloudflareError:')}`;

      // Log out the errors
      return log({
        description: `Failed to create route '${route}' on Cloudflare\n\n${errors}`,
        type: 'error',
        clear: true
      });
    }

  });

});