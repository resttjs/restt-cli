#!/usr/bin/env node

/*!
 * Restt-CLI
 * 
 * Copyright(c) 2019-present Daniel Larkin
 * MIT Licensed
 */

// Import the module and execute
require('../lib/index.js')({
  action: process.argv[2],
  script: process.argv[3]
});
