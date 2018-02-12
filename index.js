global.Promise=require('bluebird');

// const spawn = require('cross-spawn');

const server = require('./server');
// const logger = require('./lib/logger');

server.then( () => {
    // Node's spawn function does not work correctly on Windows
    // so cross-spawn is used to support both Linux and Windows
    // spawn('npm', ['start'], {cwd: 'client'});
    // logger.log('info', 'Login Manager Client running on port 3001');
});
