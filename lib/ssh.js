const node_ssh = require('node-ssh');
const waitPort = require('wait-port');

const logger = require('./logger');
const db = require('./db');

module.exports = {
    createSingleNodeDB: async (host, username, privateKey, dbUsername, serverData) => {
        let ssh = new node_ssh();
        try {
            // Wait for ssh port to open
            await waitPort({
                host: host,
                port: 22
            }, 5000);

            // Wait for authentication to initialise
            await new Promise(resolve => {
                setTimeout(resolve, 10000);
            });

            // Connect to VM
            await ssh.connect({
                host: host,
                username: username,
                privateKey: 'keys/' + privateKey
            });

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

            // Save Server to DB
            const database1 = {
                serverName: serverData.serverName,
                name: 'local',
                ip: host,
                port: serverData.serverPort,
                users: {
                    username: serverData.rootUser,
                    password: serverData.rootPass
                },
                type: 'single-node'
            };
            await db.addDBToUser(dbUsername, database1);

            const database2 = {
                serverName: serverData.serverName,
                name: 'admin',
                ip: host,
                port: serverData.serverPort,
                users: {
                    username: serverData.rootUser,
                    password: serverData.rootPass
                },
                type: 'single-node'
            };
            await db.addDBToUser(dbUsername, database2);
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
