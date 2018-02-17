const node_ssh = require('node-ssh');

const logger = require('./logger');

async function connectSSH (host, username, privateKey) {
    const noRetries = 10;
    for (let retryNo = 0 ; retryNo < noRetries; retryNo++) {
        try {
            setTimeout(await ssh.connect({
                host: host,
                username: username,
                privateKey: privateKey
            }), 1000);
            return true;
        }
        catch (err) {
            logger.log('warn', 'Cannot connect to instance. Retrying...');
        }
    }
    return false;
}

module.exports = {
    createSingleNodeDB: async (host, username, privateKey, serverData) => {
        let ssh = new node_ssh();
        try {
            // Connect to VM
            await ssh.connect({
                host: host,
                username: username,
                privateKey: 'keys/' + privateKey
                // readyTimeout: 100000
            });

            // await new Promise(resolve => {
            //     setTimeout(resolve, 10000);
            // });

            // logger.log('info', 'Connecting to Server');
            // const noRetries = 10;
            // let success = false;
            // for (let retryNo = 0 ; retryNo < noRetries || success; retryNo++) {
            //     ssh = new node_ssh();

                // try {
                //     success = await new Promise((resolve, reject) => {
                //         ssh.connect({
                //             host: host,
                //             username: username,
                //             privateKey: 'keys/' + privateKey
                //         })
                //             .then(() => {
                //                 resolve(true);
                //             })
                //             .catch(() => {
                //                 logger.log('warn', 'Cannot connect to instance. Retrying...');
                //                 reject(false);
                //             });
                //     });
                // }
                // catch (err) {
                //     logger.log('warn', 'Cannot connect to instance. Retrying...');
                // }

                // try {
                //     await ssh.connect({
                //         host: host,
                //         username: username,
                //         privateKey: 'keys/' + privateKey
                //     });
                //     success = true;
                // }
                // catch (err) {
                //     logger.log('warn', 'Cannot connect to instance. Retrying...');
                // }
            // }
            //
            // if (!success) {
            //     throw new Error('Cannot Connect to Instance');
            // }

            // Transfer necessary files
            await ssh.putFiles([{
                local: 'scripts/installDocker.sh',
                remote: '/home/' + username + '/installDocker.sh'
            },
            {
                local: 'scripts/docker-compose.yml',
                remote: '/home/' + username  + '/docker-compose.yml'
            },
            {
                local: 'scripts/createSingleNodeDB.sh',
                remote: '/home/' + username + '/createSingleNodeDB.sh'
            }]);

            const options = {
                cwd: '/home/' + username,
                stream: 'stdout',
                options: {
                    pty: true
                }
            };

            // Change permissions
            let args = ['700', 'installDocker.sh', 'createSingleNodeDB.sh'];
            let result = await ssh.exec('chmod', args, options);
            logger.log('info', result);

            // Install Docker
            args = [];
            result = await ssh.exec('./installDocker.sh', args, options);
            logger.log('info', result);

            // Create MongoDB Server
            args = [serverData.serverName, serverData.serverPort, serverData.rootUser, serverData.rootPass, serverData.mongoVersion];
            result = await ssh.exec('./createSingleNodeDB.sh', args, options);
            logger.log('info', result);
        }
        catch (err) {
            logger.log('error', err);
        }
        finally {
            if (ssh) {
                ssh.dispose();
                logger.log('info', 'Close ssh connection');
            }
        }
    }
};
