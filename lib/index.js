/*!
 * Restt-CLI
 * 
 * Copyright(c) 2019-present Daniel Larkin
 * MIT Licensed
 */

// Import the required modules from Restt-CLI
let configuration = require('./configuration');
const fs = require('./fs');
const log = require('./log');
const webpack = require('./webpack');
const cloudworker = require ('./cloudworker');
const cloudflare = require ('./cloudflare');

// Export the execution function for Restt-CLI
module.exports.execute = ({ action, script }) => {

  // Log out the default usage if no paramaters are set
  if (!action && !script) return log({ usage: true });

  // Check if the action is set in the parameters
  if (!action) return log({
    description: `Missing parameter 'action' - expects either 'serve' or 'deploy'.`,
    type: 'error',
    usage: true
  });

  // Check if the script is set in the parameters
  if (!script) return log({
    description: `Missing parameter 'script' - expects the path to the main source file (e.g. src/main.js).`,
    type: 'error',
    usage: true
  });

  // Check if the action is one of the valid actions
  if (action != 'serve' && action != 'deploy') return log({
    description: `Unexpected parameter value for 'action' - expects either 'serve' or 'deploy'.`,
    type: 'error',
    usage: true
  });

  // Define the source path of the worker script
  const sourceScript = fs.path(process.cwd(), script);

  // Define the output path of the worker script
  let outputScript = fs.path(process.cwd(), 'dist', `${fs.filename(script)}.js`);

  // Update the configuration based on action
  configuration = (action == 'serve') ? configuration.standard : configuration.production;

  // In the case where we have webpack configurations
  if (configuration.webpack && configuration.webpack.output) {

    // The output filename has been set so update the output path of the worker script
    if (configuration.webpack.output.filename && !configuration.webpack.output.path) {
      outputScript = fs.path(process.cwd(), 'dist', configuration.webpack.output.filename);
    }

    // The output filename and path have been set so update the output path of the worker script
    if (configuration.webpack.output.filename && configuration.webpack.output.path) {
      outputScript = fs.path(configuration.webpack.output.path, configuration.webpack.output.filename);
    }
  }
  
  // Check if the script file exists
  if (!fs.exists(sourceScript)) return log({
    description: `Cannot find script at '${sourceScript}'.`,
    type: 'error'
  });

  // If the action is 'serve' then run the serve actions
  if (action == 'serve') {
    
    // Compile the worker script source code into a webpack bundle in development mode (and observe and recompile on changes)
    webpack.development(sourceScript, () => {

      // Serve the compiled worker script with cloudworker after a successful build
      cloudworker.serve(outputScript);
    });

  }

  // If the action is 'deploy' then run the deploy actions
  if (action == 'deploy') {
    
    // Compile the worker script source code into a webpack bundle in production mode
    webpack.production(sourceScript, () => {

      // Deploy the compiled worker script to cloudflare after a successful build
      cloudflare.upload(outputScript);
    });
  }
  
}