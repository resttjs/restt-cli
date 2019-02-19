/* Configuration binder for Restt-CLI */

// Import the required modules from Restt-CLI
const fs = require('./fs');
const log = require('./log');

// Read the configuration files
const standardConfiguration = (() => {

  // Default Restt configuration (in the res folder of the package)
  const defaultConfig = fs.path(__dirname, '../res', 'restt.config.json');

  // Restt configuration (in the project folder)
  const resttConfig = fs.path(process.cwd(), 'restt.config.json');

  // Webpack configuration (in the project folder)
  const webpackConfig = fs.path(process.cwd(), 'webpack.config.js');

  // Define the configuration options (read the default options first)
  let configuration = { 
    webpack: { 
      plugins: [] 
    }, 
    ...fs.readJSON(defaultConfig) 
  };

  // Check if there is a webpack.config.json
  if (fs.exists(webpackConfig)) {
    
    // Extend the configuration options
    configuration = {
      ...configuration,
      webpack: { 
        ...configuration.webpack, 
        ...require(webpackConfig) 
      }
    }
  }

  // Check if there is a restt.config.json
  if (fs.exists(resttConfig)) {

    // Load the restt.config.json from the project
    const options = fs.readJSON(resttConfig);

    // Extend the configuration options
    configuration = {
      ...options,
      cloudflare: {
        ...configuration.cloudflare,
        ...options.cloudflare
      },
      cloudworker: {
        ...configuration.cloudworker,
        ...options.cloudworker
      },
      webpack: {
        ...configuration.webpack,
        ...options.webpack
      } 
    }

  } else {

    // Log out a warning message as there is no configuration file
    log({
      description: 'restt.config.json cannot be found in this project directory - using default configuration',
      type: 'warning',
    })
  }

  // Define the version specs
  let versions = {};

  // Restt module package.json
  const resttPackageJSON = fs.path(process.cwd(), 'node_modules/restt/package.json');

  // Check if the Restt package.json exists and add the version to specs
  if (fs.exists(resttPackageJSON)) versions.restt = fs.readJSON(resttPackageJSON).version;

  // Add the version specs from Restt-CLI
  versions.cli = fs.readJSON(fs.path(__dirname, '../package.json')).version;

  // Add all of the version specs to the configuration
  configuration = { 
    ...configuration, 
    'restt': {
      versions 
    }
  };

  // Return the configuration
  return configuration;

})();

// Read the production configuration if possible
const productionConfiguration = (() => {
  
  // Load the standard configuration
  let configuration = standardConfiguration;

  // Restt production configuration (in the project folder)
  const resttProductionConfig = fs.path(process.cwd(), 'restt.production.config.json');
  
// Check if there is a restt.config.prod.json
  if (fs.exists(resttProductionConfig)) {

    // Load the restt.production.config.json from the project
    const options = fs.readJSON(resttProductionConfig);

    // Extend the configuration options
    configuration = {
      ...options,
      cloudflare: {
        ...configuration.cloudflare,
        ...options.cloudflare
      },
      cloudworker: {
        ...configuration.cloudworker,
        ...options.cloudworker
      },
      webpack: {
        ...configuration.webpack,
        ...options.webpack
      } 
    }

  }

  // Return the configuration
  return configuration;
})();

// Export the modules
module.exports = {
  standard: standardConfiguration,
  production: productionConfiguration
}