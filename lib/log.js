/* Logging handler for Restt-CLI */

// Define whether the previous log had a clear / new line at the end
let previousClear = false;

// Log a message to the console
module.exports = ({ description, label = '\x1b[0m\x1b[36m\x1b[1m[Restt]\x1b[0m', type = 'info', usage = false, clear = false }) => {

  // Define the default styles
  const style = {
    info: '\x1b[0m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m'
  }

  // If the previous log did not have clear then add a new line first
  if (!previousClear) console.log();

  // If there is a description set
  if (description) {

    // Stringify the object if we have one
    if (typeof description == 'object') description = JSON.stringify(description, null, 2);

    // Check whether or not to label the logs
    if (label) {
      
      // Log to the console with the label [Restt] by default
      console.log(label, `${style[type]}${description}\x1b[0m`);
    } else {
      
      // Log out to the console
      console.log(`${style[type]}${description}\x1b[0m`);
    }

    // Create a new line before usage
    if (usage) console.log();
  }

  // If the usage flag is set then log the usage
  if (usage) {
      // Log the usage options for the CLI
      console.log('\x1b[0m\x1b[36m\x1b[1mUsage:\x1b[0m');
      console.log('\x1b[36m  • Webpack (in development) and serve the worker script locally using Cloudworker');
      console.log('\x1b[2m       restt serve [script] \x1b[0m');
      console.log('\x1b[36m  • Webpack (in production) and upload the worker script to Cloudflare Workers');
      console.log('\x1b[2m       restt deploy [script] \x1b[0m');
  }

  // Create a new line before the next line
  if (clear) console.log();

  // Update the previousClear flag
  previousClear = clear;

  // If log type is not error then return true
  return (type == 'error') ? false : true;
}