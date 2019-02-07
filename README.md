<p align="center">
  <a href="https://restt.io" target="_blank">
    <img src="https://i.imgur.com/2FDigys.png">
  </a>
</p>

<p align="center">
  <a href="https://packagephobia.now.sh/badge?p=restt-cli" rel="nofollow" style="text-decoration: none;"><img src="https://packagephobia.now.sh/badge?p=restt-cli" alt="Install Size" style="max-width: 100%;"></a>
  <a href="https://snyk.io/vuln/search?q=restt&type=npm" rel="nofollow" style="text-decoration: none;"><img src="https://img.shields.io/snyk/vulnerabilities/github/resttjs/restt-cli.svg" alt="Vulnerabilities" style="max-width: 100%;"></a>
  <a href="https://npmcharts.com/compare/restt-cli?minimal=true" rel="nofollow" style="text-decoration: none;"><img src="https://img.shields.io/npm/dt/restt-cli.svg" alt="Downloads" style="max-width: 100%;"></a>
  <a href="https://www.npmjs.com/package/restt-cli" rel="nofollow" style="text-decoration: none;"><img src="https://img.shields.io/npm/l/restt-cli.svg" alt="Licence" style="max-width: 100%;"></a>
</p>

***

Restt-CLI is powerful command line interface crafted to enrich the workflow for developers using [Restt](https://github.com/resttjs/restt) or any other framework to develop fast, secure and reliable edge worker services.<br>

## Benefits

#### Few package dependencies

Built with only [Webpack](https://github.com/webpack/webpack) and [Cloudworker](https://github.com/dollarshaveclub/cloudworker) as dependencies for optimal security<br>

#### Auto-compilation and hot-reloading

Automatically recompile and reload your edge worker services on any changes when developing for testing in an instant<br>

#### Rapid production distribution

Distribute your edge worker services to people all around the globe instantly with [Cloudflare Workers](https://developers.cloudflare.com/workers/)<br>

## Overview

- [Installation](#installation)
- [Documentation](#documentation)
  - [Configuration](#configuration)
  - [Serving for development](#serving-for-development)
  - [Deploying to the edge](#deploying-to-the-edge)
- [Supporters](#supporters)
- [Contributing](#contributing)
- [Security](#security)
- [Licence](#licence)

## Installation

Restt-CLI is available through the [npm registry](https://www.npmjs.com/package/restt-cli):

```bash
$ npm install -g restt-cli
```

## Documentation

##### Configuration

After installing Restt-CLI, `restt.config.json` will automatically be added to your project directory.<br>

It includes all of the the following default configurations required for running Restt-CLI:<br>

###### restt.config.json
```ts
{
  // Default properties relating to Cloudflare
  "cloudflare": {

    // Cloudflare domain zone (needs to be configured for deployment with WorkersKV)
    "account": ""

    // Cloudflare email address (needs to be configured for deployment)
    "email": "",

    // Cloudflare authentication key (needs to be configured for deployment)
    "key": "",

    // Cloudflare domain zone (needs to be configured for deployment)
    "zone": ""
  },

  // Default properties relating to Cloudworker
  "cloudworker": {

    // Cloudworker debug flag (optional)
    "debug": false,

    // Cloudworker deployment port (needs to be configured for serving)
    "port": 3000
  },

  // Default properties relating to Cloudflare WorkersKV
  "workerskv": {

    // Namespaces to use in Cloudflare WorkersKV (optional)
    // Expects an array of strings of which each must be uppercase A-Z (e.g. DEMOSPACE)
    "namespaces": []
  }
}
```

All properties in `restt.config.json` will be bound to the `configuration` object which is accessible from within your edge worker script which is [served](https://github.com/resttjs/restt/blob/README.md#serving-for-development) or [deployed](https://github.com/resttjs/restt/blob/README.md#deploying-to-the-edge) with Restt-CLI.<br>

###### restt.config.json

```ts
{
  "cloudworker": {
    "debug": false,
    "port": 3000
  },
  ...
  "credentials": {
    "authkey": "12345678"
  }
}
```

###### example-worker.js

```ts
// Outputs "12345678" to the console
console.log(configuration.credentials.authkey);
```

If you also have a `webpack.config.js` in your project directory, then Restt-CLI will also load and use it when compiling your edge worker script.<br>

You can also add webpack configurations to your `restt.config.json` which will be prioritised over your `webpack.config.js`.<br>

###### restt.config.json

```ts
```ts
{
  "cloudworker": {
    "debug": false,
    "port": 3000
  },
  ...
  "webpack": {
    "output": {
      "filename": "demo.restt.worker.js"
    }
  }
}
```

### Serving for development

Restt-CLI makes developing your edge worker services fast and simple.<br>

Automatically build and serve your edge worker service:<br>

```bash
$ restt serve [script]
```

`script` must point to the path where your edge worker script is located (e.g. `src/helloworld-service.js`).<br>

While running `serve`, any modifications to your script will be detected automatically, and your script will be recompiled and hot-reloaded.<br>

[Service origins](https://github.com/resttjs/restt/blob/README.md#serviceorigin) used in [Restt Services](https://github.com/resttjs/restt/blob/README.md#service) will be automatically rewritten based on your [cloudworker.port](#configuration).<br>

Example: `https://demo.restt.io` becomes `http://localhost:3000/demo.restt.io`<br>

### Deploying to the edge

Restt-CLI can instantly build and distribute your edge worker scripts in production mode to all over the globe.<br>

Running the following command will automatically build and distribute your edge worker script:<br>

```bash
$ restt deploy [script]
```

`script` must point to the path where your worker script is located (e.g. `src/helloworld-service.js`).<br>

When deploying for production your edge worker script will be shipped to [Cloudflare Workers](https://developers.cloudflare.com/workers/) using the credentials specified in your [restt.config.json](#configuration) file.<br>

Please ensure that you have setup Cloudflare Workers on your Cloudflare account if you are deploying.<br>

When using [Cloudflare WorkerKV](https://developers.cloudflare.com/workers/kv/), please also ensure that you have WorkerKV configured on your account.<br>

## Supporting

Restt-CLI is generously supported month to month by [these amazing people, teams and organisations](https://github.com/resttjs/restt/blob/master/SUPPORTERS.md)!

If you appreciate Restt-CLI and would like to regularly support the maintenance of it, please consider becoming a supporter, partner or sponsor through [Patreon](https://www.patreon.com/larkin_nz).<br>

One-time donations can also be made through [PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=daniel@larkin.nz&lc=NZ&item_name=Donation&no_note=0&cn=&curency_code=USD&bn=PP-DonationsBF:btn_donateCC_LG.gif:NonHosted).<br>

## Contributing

Please feel free to implement any features you feel Restt-CLI is missing by submitting a [pull request](https://github.com/resttjs/restt-cli/pulls).<br>

Alternatively, you can submit a [feature request](https://github.com/resttjs/restt-cli/issues/new) and I will review it as soon as possible.<br>

All contributions are greatly appreciated!<br>

## Security

Restt-CLI has been built with ultimate security in mind and has as very few dependencies to mitigate most risks, vulnerabilities and exploits which can come with using third-party packages.<br>

Restt-CLI contains both [Webpack](https://github.com/webpack/webpack) and [Cloudworker](https://github.com/dollarshaveclub/cloudworker) as dependencies.<br>

At present it is incredibly difficult to create software which uses JavaScript packages or modules without a compilation tool such as Webpack<br>

Likewise, it is a difficult task to deploy edge workers locally for development and testing without a runner like Cloudworker.<br>

Webpack and Cloudworker are both made by highly respectable developers, teams and organisations who also are very security conscious.<br>

No package or module can guarantee complete security of your code and any data which passes through it.<br>

Security is at the core of Restt and I aim to continue to do all I can to improve the security for anyone using Restt.<br>

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, Daniel Larkin


