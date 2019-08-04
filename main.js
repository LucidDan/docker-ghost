/**
 * main.js
 *
 * A loader program to call some functions in server.js and then launch the Ghost process.
 * This is split out from server.js to make testing easier.
 */

// Built-in dependencies
const fs = require('fs');
const url = require('url');

// Third-party dependencies
const server = require('./server.js');

// -------- Start main program --------

try {
    var node_env = 'development';
    if (!!process.env.NODE_ENV) {
        node_env = process.env.NODE_ENV;
    }
    console.log('NODE_ENV=' + node_env + '\n');
    // Generate and write config.production.json file
    const configData = JSON.stringify(server.generateGhostConfig(), null, 2);
    fs.writeFileSync(
        'config.' + node_env + '.json',
        configData,
        'utf8'
    );

    if (process.env.DEBUG === 'true') {
        console.log('DEBUG OUTPUT: Config dump:\n' + configData + '\n');
    }

    // This will launch an async process to start the express server and Ghost.
    // It feels slightly hacky? But it seems to be fine, and I prefer it to launching a child process
    require('./current/index.js');
} catch (err) {
    // Handle errors in the promise chain.
    // Just log it and exit??
    console.log('Encountered error starting Ghost: ' + (err ? err.toString() : '<unknown error>'));
    process.exit(1);
}

