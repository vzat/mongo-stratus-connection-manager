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
    },
    createReplicaSetDB: async (hosts, username, privateKey, dbUsername, serverData) => {
        try {
            let promises = [];
            const totalHosts = hosts.length;
            let primarySSH;
            for (let hostNo; hostNo < totalHosts; hostNo++) {
                const host = hosts[hostNo];
                let ssh = new node_ssh();

                const promise = new Promise(async resolve => {

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
                        local: 'scripts/docker-compose-RS.yml',
                        remote: '/home/' + username  + '/docker-compose.yml'
                    },
                    {
                        local: 'scripts/createReplicaSetDB.sh',
                        remote: '/home/' + username + '/createReplicaSetDB.sh'
                    }]);

                    // Setup scripts location and enable pseudo-terminal
                    const options = {
                        cwd: '/home/' + username,
                        stream: 'stdout',
                        options: {
                            pty: true
                        }
                    };

                    // Change permissions
                    let args = ['700', 'installDocker.sh', 'createReplicaSetDB.sh'];
                    let result = await ssh.exec('chmod', args, options);
                    logger.log('info', result);

                    // Install Docker
                    args = [];
                    result = await ssh.exec('./installDocker.sh', args, options);
                    logger.log('info', result);

                    // Create MongoDB Server
                    args = [serverData.serverName, serverData.serverPorts[hostNo], serverData.rootUser, serverData.rootPass, serverData.mongoVersion, serverData.replicaSetName];
                    result = await ssh.exec('./createReplicaSetDB.sh', args, options);
                    logger.log('info', result);

                    if (hostNo === 0) {
                        primarySSH = ssh;
                    }
                    else {
                        ssh.dispose();
                        logger.log('info', 'Close ssh connection ' + hostNo);
                    }

                    resolve();
                });
                promises.push(promise);
            }

            // Wait for the dbs to be created
            await Promise.all(promises);

            if (primarySSH) {
                // Transfer replica set setup file
                await primarySSH.putFiles([{
                    local: 'scripts/setupReplicaSet.sh',
                    remote: '/home/' + username + '/setupReplicaSet.sh'
                }]);

                // Setup scripts location and enable pseudo-terminal
                const options = {
                    cwd: '/home/' + username,
                    stream: 'stdout',
                    options: {
                        pty: true
                    }
                };

                // Change permissions
                let args = ['700', 'setupReplicaSet.sh'];
                let result = await primarySSH.exec('chmod', args, options);
                logger.log('info', result);

                // Create membersList file
                let membersList = '"[\n';
                for (let hostNo; hostNo < totalHosts; hostNo++) {
                    const host = hosts[hostNo];
                    const port = serverData.serverPorts[hostNo];
                    let priority = 1;

                    // Set the first host as the primary
                    if (hostNo === 0) {
                        priority = 500;
                    }

                    membersList += '_id: ' + hostNo + ', host: ' + host + ':' + port + ', priority: ' + priority + ' },';
                }
                membersList.slice(0, -1);
                membersList += '\n]"';

                logger.log('info', membersList);

                args = ['-e', membersList, '>', 'memberList.txt'];
                result = await primarySSH.exec('echo', args, options);
                logger.log('info', result);

                args = [serverData.serverName, serverData.rootUser, serverData.rootPass, serverData.replicaSetName];
                result = await primarySSH.exec('./setupReplicaSet.sh', args, options);
                logger.log('info', result);
            }
            else {
                throw new Error('Primary ssh not found');
            }
        }
        catch (err) {
            logger.log('error', err);
        }
    }
};
