#!/usr/bin/env node

/*!
 * Restt-CLI
 * 
 * Copyright(c) 2019-present Daniel Larkin
 * MIT Licensed
 */

// Import the Restt-CLI module
const cli = require('../lib/index.js');

// Execute the action on the CLI
cli.execute({
  action: process.argv[2],
  script: process.argv[3]
});
