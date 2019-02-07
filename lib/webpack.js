// Import the required packages
const webpack = require('webpack');

// Import the required modules from Restt-CLI
const configuration = require('./configuration');
const fs = require('./fs');
const log = require('./log');

// Define the number of times a script has been built
let built = 0;

// Load any webpack options
const options = (configuration.webpack) ? configuration.webpack : {};

// Delete the irrelevant keys from the webpack options
if (options.devServer) delete options.devServer;
if (options.server) delete options.serve;

// Create a webpack instance based on the paramaters
const configure = (mode, script) => {

  // Attempt to create a webpack configuration
  try {

    return webpack({
      ...options,
      mode,
      target: 'webworker',
      entry: {
        // Name the file the same as the script
        [fs.filename(script)]: script
      },
      plugins: [
        ...options.plugins,
        // Bind the values from restt.config.json to 'configuration'
        new webpack.DefinePlugin({ 'configuration': webpack.DefinePlugin.runtimeValue(() => JSON.stringify(configuration))})
      ]
    });
  } catch (e) {

    console.log(this.error)

    // Log an error message about the webpack configuration
    return log({
      description: `Failed to package the worker script with Webpack\n\n\x1b[31m${e.message}`,
      type: 'error',
      clear: true
    });
  }
}

// Parse the stats from a webpacking
const parseStats = (stats) => {

  // Define the options for the stats
  let options = { 
    assets: true,
    entrypoints: false,
    version: false,
    modules: false,
    chunks: false,
    builtAt: false,
    chunkGroups: false,
    chunkModules: false,
    chunkOrigins: false,
    publicPath: false,
    children: false,
    errors: true,
    warnings: true,
    colors: true
  }

  // Extract the data from the stats
  const { assets, hash, time, outputPath } = stats.toJson(options);

  // Calculate the filesize and format it
  const size = filesize(assets[0].size).replace(' ', ' \x1b[0m');

  // Format the success string
  const output = `  File: \x1b[1m${assets[0].name}\x1b[0m\n` +
                 `  Path: \x1b[1m${outputPath}\x1b[0m\n` +
                 `  Hash: \x1b[1m${hash}\x1b[0m\n` +
                 `  Time: \x1b[1m${time}\x1b[0mms\n` +
                 `  Size: \x1b[1m${size}\x1b[0m`;

  // Remove all the details from the stats other than errors and warnings
  options = {
    ...options, 
    assets: false,
    hash: false,
    timings: false,
    outputPath: false
  }

  // Check if we have any errors
  if (stats.hasErrors()) {

    // Return the errors
    return stats.toString(options);
  }

  // Return the formatted details and warnings
  return output + stats.toString(options);
}

// Calculate a file size from bytes
const filesize = (bytes) => {

  // Define the units
  const units = ['bytes', 'KiB', 'MiB'];
  
  // Calculate the values
  let l = 0;
  let n = parseInt(bytes, 10) || 0;

  while(n >= 1024 && ++l) n = n / 1024;

  // Return the formatted number with 100ths of a unit
  return(n.toFixed(n < 10 && l > 0 ? 2 : 0) + ' ' + units[l]);
}

// Handle the output from webpack
const handle = (error, stats, success) => {

  // Define the webpack output (or the error message)
  const output = (!error) ? parseStats(stats) : `\n\x1b[31m${error.message}`;

  // Increase the number of times the package has been built
  built++;

  // Check if we have any errors
  if (error || stats.hasErrors()) {
    
    // Log an error message about the build
    return log({
      description: `Failed to ${((built > 1) ? 're' : '')}package the worker script with Webpack\n\x1b[0m${output}`,
      type: 'error',
      clear: true
    });

  } else {

    // Define the label for [webpack]
    const label = '\x1b[0m\x1b[34m\x1b[1m[Webpack]\x1b[0m'

    // Log a success message about the build
    log({
      description: `Successfully ${((built > 1) ? 're' : '')}packaged the worker script with Webpack\n\n\x1b[0m${label}\n${output}`,
      type: 'success',
      clear: true
    });

    // Execute the success callback if there is one
    if (success) success();
  }
}

// Compile and watch the script with webpack for serve mode
module.exports.development = (script, success) => {

  // Create a webpack builder for the script
  const instance = configure('development', script);
  
  // Run the instance and log out the messages and call the success object if there is one
  if (instance) instance.watch({}, (error, stats) => handle(error, stats, success));
}

// Compile the script with webpack for deploy mode
module.exports.production = (script, success) => {

  // Create a webpack builder for the script
  const instance = configure('production', script);
  
  // Run the instance and log out the messages and call the success object if there is one
  if (instance) instance.run((error, stats) => handle(error, stats, success));
}