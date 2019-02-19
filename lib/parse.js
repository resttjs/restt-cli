/* Parse and handle functions for Restt-CLI */

// Import the required modules from Restt-CLI
const fs = require('./fs');

// Handle stack / code errors
module.exports.errorStack = (error) => new Promise(resolve => {

  // Format the error from the stack
  // e.g. ReferenceError: domain is not defined at eval (./src/services/test.js?:16:40)
  let stack = error.stack.match(/(\w*Error[^\)]*)/smg)[0].replace('\n   ', '').replace('webpack:///', '')+')';

  // Format the error further
  // e.g. ['ReferenceError: domain is not defined', './src/services/customers.js', '16', '40']
  stack = stack.match(/(.*)\ at.*\((.*)\?\:(\d*)\:(\d*)/);

  // Return the stand error message if we don't have a trace
  if (!stack) resolve(String(error));

  // Read the error file as text
  const file = fs.read(stack[2]);

  // Count the number of imports and exports
  const importNumber = (file.match(/import\ .*[\"\']*/gm) || []).length;
  const exportNumber = (file.match(/export\ /gm) || []).length;

  // Starting adjustment based on the imports and exports (relative to webpack)
  const adjustment = (n) => {
    
    // Let the start be the actual line
    let start = Number(stack[3]);
    
    // Minus and imports and exports
    if (importNumber > 0) start -= importNumber + 1; 
    if (exportNumber > 0) start -= exportNumber + 1; 

    // Return the adjustment minus the number of chars before the actual error line
    return start - n;
  }

  // Read the line in the file (2 lines before and after error)
  fs.readLines(stack[2], adjustment(2), 5, true).then(line => {

    // Define the error in a user friendly way
    resolve(`${stack[1]}\n\nError in: ${stack[2]}\n\n${line}`);
  });

});