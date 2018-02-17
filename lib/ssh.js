const fs = require('fs');

const node_ssh = require('node-ssh');

const logger = require('./logger');

module.exports = {
    createSingleNodeDB: async (host, username, privateKey, serverData) => {
        let ssh;
        try {
            ssh = new node_ssh();

            // Connect to VM
            await ssh.connect({
                host: host,
                username: username,
                privateKey: 'keys/' + privateKey
            });

            // Transfer necessary files
            await ssh.putFiles([{
                local: 'scripts/installDocker.sh',
                remote: '/home/vlad_mihail_zat/installDocker.sh'
            },
            {
                local: 'scripts/createSingleNodeDB.sh',
                remote: '/home/vlad_mihail_zat/createSingleNodeDB.sh'
            }]);

            // Change permissions
            let args = ['700', 'installDocker.sh', 'createSingleNodeDB.sh'];
            let result = await ssh.exec('chmod', args, {cwd: '/home/vlad_mihail_zat', stream: 'stdout'});
            logger.log('info', result);

            // Install Docker
            args = [];
            result = await ssh.exec('./installDocker.sh', args, {cwd: '/home/vlad_mihail_zat', stream: 'stdout'});
            logger.log('info', result);

            // Create MongoDB Server
            args = [serverData.serverName, serverData.serverPort, serverData.rootUser, serverData.rootPass, serverData.mongoVersion];
            result = await ssh.exec('./createSingleNodeDB.sh', args, {cwd: '/home/vlad_mihail_zat', stream: 'stdout'});
            logger.log('info', result);
        }
        catch (err) {
            logger.log('error', err);
        }
        finally {
            if (ssh) {
                ssh.dispose();
            }
        }
    }
};
