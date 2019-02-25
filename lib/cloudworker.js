/* Cloudworker functions for Restt-CLI */

// Import the required packages
const Cloudworker = require('@dollarshaveclub/cloudworker');
const { KeyValueStore } = require('@dollarshaveclub/cloudworker/lib/kv');

// Import the required modules from Restt-CLI
const configuration = require('./configuration').standard;
const cloudflare = require('./cloudflare');
const parse = require('./parse');
const fs = require('./fs');
const log = require('./log');
const portcheck = require('./portcheck');

// Define the service
let service;

// Define the connections
let connections = [];

// Define the debug flag for cloudworker service
const debug = configuration.cloudworker.debug;

// Define the port to run the cloudworker service
const port = configuration.cloudworker.port;

// Define the label for cloudworker logs
const label = '\x1b[0m\x1b[34m\x1b[1m[Cloudworker]\x1b[0m';

// Define the failed to serve message
const failed = `Failed to deploy the worker script with Cloudworker`;

// Handle the console logs for the script
const workerConsole = {

  // Bind custom standard logging behaviour
  log(...args) {
    
    // Log out all the messages
    return log({
      description: (() => {
        // Iterate through each of the args and stringify if an object
        for (const i in args) if (typeof args[i] == 'object') args[i] = JSON.stringify(args[i], null, 2);

        // Return the arguments as a string
        return args.join(' ');
      })(),
      label: label
    });
  },

  // Bind custom error logging behaviour
  error(...args) {

    // Extract the first error
    const error = args[0];

    // Check if there is a stack for code errors
    if (error.stack) {

      // Handle code errors
      return parse.errorStack(error).then(formatted => {

        // Send an error message log
        return log({
          description: formatted,
          type: 'error',
          label: label,
          clear: true
        });

      });

    } else {

      // Handle regular string errors
      return log({
        description: (() => {
          // Iterate through each of the args and stringify if an object
          for (const i in args) if (typeof args[i] == 'object') args[i] = JSON.stringify(args[i], null, 2);

          // Return the arguments as a string
          return args.join(' ');
        })(),
        type: 'error',
        label: label,
        clear: true
      });
    }
  }
}

// Try and catch any errors in the cloudworker script
const tryCatch = (fn) => {
  
  // Wrap in a try catch so we can handle the errors in the worker script
  try {

    // Call the function
    fn();

  // Handle the errors if there are any
  } catch (error) {

    // Check if there is a stack for code errors
    if (error.stack) {

      // Handle code errors
      return parse.errorStack(error).then(formatted => {

        // Send an error message log
        return log({
          description: formatted,
          type: 'error',
          label: label,
          clear: true
        });

      });
    
    // Handle default text errors
    } else {

      // Send an error message log
      return log({
        description: String(error),
        type: 'error',
        label: label,
        clear: true
      });
    }

  }
}

// Start the service worker script on a cloudworker
const startService = (worker) => {

  // Define the default options for the worker
  const options = { 
    enableCache: true,
    debug: debug,
    bindings: {
      console: workerConsole,
      ResttCLI: {
        storeRoute: cloudflare.storeRoute
      }
    }
  }

  // Check if there are any Workers KV namespaces
  if (configuration.workerskv && configuration.workerskv.namespaces) {

    // Define the directory
    const directory = fs.path(`${process.cwd()}/.kv-db`);

    // Create the directory if it does not exist
    if (!fs.exists(directory) && configuration.workerskv.namespaces.length > 0) fs.createDirectory(directory);

    // Iterate through each of the namespaces
    for (const namespace of configuration.workerskv.namespaces) {
      
      // Check if the namespace is one of the restricted keys
      if (['console', 'cache', 'process', 'configuration', 'ResttCLI'].indexOf(namespace) > -1) {

        // Throw an error as the namespace is one of the restricted keys
        throw(`${failed}\n\nWorkersKV: Namespace cannot be called '${namespace}' as this is a restricted key`);
      }

      // Check if the namespace contains anything other than letters
      if (namespace.match(/[^\w\d]/ig)) throw(`${failed}\n\nWorkersKV: Namespace must only contain letters and numbers`);

      // Bind the namespace
      options.bindings[namespace] = new KeyValueStore(fs.path(`${directory}/${namespace}.db`));
    }
  }

  // Check whether the port is available
  portcheck(port).then(success => {

    // Attempt to start the worker service and catch any errors
    tryCatch(() => {

      // Send a log for the script deployment
      log({
        description: `Successfully ${((service) ? 're' : '')}deployed the worker script with Cloudworker to \x1b[36mhttp://localhost:${port}`,
        type: 'success',
        clear: true
      });

      // Create cloudworker and bind it to the service variable
      service = new Cloudworker(worker, options).listen(port);

      // Store all the connections
      service.on('connection', (connection) => connections.push(connection));
    });

  }).catch(error => {

    // Catch any errors from portcheck as we cannot start the serive
    tryCatch(() => { throw(`${failed}\n\n${String(error)}`) });
  });

}


// Create a service with cloudworker
module.exports.serve = (script) => {

  // Read the worker script
  const worker = fs.read(script);

  // Check if we have a service currently
  if (service) {

    // Close all of the connections
    for (const connection of connections) connection.destroy();

    // Reset the list of connections
    connections = [];

    // Stop the service
    service.close();

    // Redeploy the service on changes
    service.once('close', () => {

      // Try to run the worker script and catch errors
      tryCatch(() => startService(worker));

    });

  } else {

    // Try to run the worker script and catch errors
    tryCatch(() => startService(worker));
  }
}