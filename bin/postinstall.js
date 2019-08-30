#!/usr/bin/env node

/* Post-install script for Restt-CLI */

// Import the required modules from Restt-CLI
const fs = require('../lib/fs');

// Read the base restt.config.json from the package
const base = require(fs.path(__dirname, '../res/restt.config.json'));

// Path for the output configuration file
const path = fs.path(process.env.INIT_CWD, 'restt.config.json');

// Check if there is a restt.config.json in the project directory
if (fs.exists(path)) {

  // Read the restt.config.json in the project directory
  const current = fs.readJSON(path);

  // Merge the JSON from the current and base configuration
  const configuration = {
    ...current, 
    cloudflare: {
      ...base.cloudflare, 
      ...current.cloudflare
    },
    cloudworker: {
      ...base.cloudworker, 
      ...current.cloudworker
    },
    workerskv: {
      ...base.workerskv, 
      ...current.workerskv
    },
  };

  // Write the file as JSON to the project directory
  return fs.writeJSON(path, configuration);
}

// Write the default file as JSON to the project directory
return fs.writeJSON(path, base);