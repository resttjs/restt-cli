/* Filesystem functions for Restt-CLI */

// Import the required packages
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Resolve a path for a file
module.exports.path = (...args) => path.resolve(...args);

// Resolve a filename from a path
module.exports.filename = (file) => path.parse(file).name;

// Create a directory
module.exports.createDirectory = (dir) => fs.mkdirSync(dir);

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

// Read a number of lines from a line
module.exports.readLines = (file, start, count = 1, numbers = false) => new Promise(resolve => {

  // Create a file linereader
  const reader = readline.createInterface({
    input: fs.createReadStream(path.resolve(file)),
    output: null,
    console: false
  });

  // Start at line 1
  let read = 1;

  // Create a string of lines
  let lines = '';

  // Read a line and return it if the count is equal to the line
  reader.on('line', (line) => {

    // Define the read column
    const lineColumn = (String(read).length < String(start + count).length) ? ` ${read}| ` : `${read}| `;

    // If the line is within the range then add it to the lines
    if (read >= start && read < (start + count)) lines += ((numbers) ? `${lineColumn}${line}` : line);

    // If there are many lines add a new line character
    if (read >= start && read < (start + count) && count > 1) lines += '\n';

    // Resolve the promise if at the last line to read
    if (read == (start + count - 1)) resolve(lines);

    // Increase the read count
    read++;

  });

  // Resolve if we've ran out of lines
  reader.on('close', () => resolve(lines));

});