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
    // Generate and write config.production.json file
    fs.writeFileSync(
        'config.production.json',
        JSON.stringify(server.generateGhostConfig(), null, 2),
        'utf8'
    );

    // This will launch an async process to start the express server and Ghost.
    // It feels slightly hacky? But it seems to be fine, and I prefer it to launching a child process
    require('./current/index.js');
} catch (err) {
    // Handle errors in the promise chain.
    // Just log it and exit??
    console.log('Encountered error starting Ghost: ' + (err ? err.toString() : '<unknown error>'));
    process.exit(1);
}

