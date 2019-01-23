/* Filesystem functions for Restt-CLI */

// Import the required packages
const fs = require('fs');
const path = require('path');

// Resolve a path for a file
module.exports.path = (...args) => path.resolve(...args);

// Resolve a filename from a path
module.exports.filename = (file) => path.parse(file).name;


// module.exports.basename = (path) => {
//   path.win32.basename(script)
// }

// Check if a file exists
module.exports.exists = (file) => fs.existsSync(file);

// Read a file as a string
module.exports.read = (file) => fs.readFileSync(file, { encoding: 'utf8' });

// Read a file as a Buffer
module.exports.readBuffer = (file) => fs.readFileSync(file);

// Read a file as JSON
module.exports.readJSON = (file) => JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));

// Write a file as JSON
module.exports.writeJSON = (file, json) => fs.writeFileSync(file, JSON.stringify(json, null, 2));