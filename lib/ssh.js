const crypto = require('crypto');

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

            // Generate keyfile used for the internal authentication of the replica set
            const keyfile = await crypto.randomBytes(128).toString('hex');

            for (let hostNo = 0; hostNo < totalHosts; hostNo++) {
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

                    let files = [{
                        local: 'scripts/installDocker.sh',
                        remote: '/home/' + username + '/installDocker.sh'
                    },
                    {
                        local: 'scripts/createReplicaSetDB.sh',
                        remote: '/home/' + username + '/createReplicaSetDB.sh'
                    },
                    {
                        local: 'scripts/Dockerfile-RS',
                        remote: '/home/' + username + '/Dockerfile'
                    },
                    {
                        local: 'scripts/docker-compose-RS.yml',
                        remote: '/home/' + username + '/docker-compose.yml'
                    }];

                    files.push();

                    if (hostNo === 0) {
                        files.push({
                            local: 'scripts/setupReplicaSet.sh',
                            remote: '/home/' + username + '/setupReplicaSet.sh'
                        });
                    }

                    // Transfer necessary files
                    await ssh.putFiles(files);

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

                    // Send the keyfile to the server
                    result = await ssh.execCommand('echo ' + keyfile + ' > /home/' + username + '/mongo.key');
                    logger.log('info', result);

                    // Create MongoDB Server
                    args = [serverData.serverName, serverData.serverPorts[hostNo], serverData.rootUser, serverData.rootPass, serverData.mongoVersion, serverData.replicaSetName];
                    result = await ssh.exec('./createReplicaSetDB.sh', args, options);
                    logger.log('info', result);

                    // Delete the keyfile
                    args = ['-f', 'mongo.key'];
                    result = await ssh.exec('rm', args, options);
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

            logger.log('info', 'Created DBs');

            if (primarySSH) {
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
                for (let hostNo = 0; hostNo < totalHosts; hostNo++) {
                    const host = hosts[hostNo];
                    const port = serverData.serverPorts[hostNo];
                    let priority = 1;

                    // Set the first host as the primary
                    if (hostNo === 0) {
                        priority = 500;
                    }

                    membersList += '\t{ _id: ' + hostNo + ', host: \'' + host + ':' + port + '\', priority: ' + priority + ' }';

                    if (hostNo === totalHosts - 1) {
                        membersList += '\n';
                    }
                    else {
                        membersList += ',\n';
                    }
                }
                membersList += ']"';

                logger.log('info', membersList);

                result = await primarySSH.execCommand('echo -e ' + membersList + ' > membersList.txt');
                logger.log('info', result);

                args = [serverData.serverName, serverData.rootUser, serverData.rootPass, serverData.replicaSetName];
                result = await primarySSH.exec('./setupReplicaSet.sh', args, options);
                logger.log('info', result);

                primarySSH.dispose();
            }
            else {
                throw new Error('Primary ssh not found');
            }

            // Save Server to DB
            const database1 = {
                serverName: serverData.serverName,
                name: 'local',
                ip: hosts,
                port: serverData.serverPorts,
                users: {
                    username: serverData.rootUser,
                    password: serverData.rootPass
                },
                type: 'replica-set'
            };
            await db.addDBToUser(dbUsername, database1);

            const database2 = {
                serverName: serverData.serverName,
                name: 'admin',
                ip: hosts,
                port: serverData.serverPorts,
                users: {
                    username: serverData.rootUser,
                    password: serverData.rootPass
                },
                type: 'replica-set'
            };
            await db.addDBToUser(dbUsername, database2);
        }
        catch (err) {
            logger.log('error', err);
        }
    },
















    createShardedClusterDB: async (configHosts, shardsHosts, mongosHosts, username, privateKey, dbUsername, serverData) => {
        try {
            let promises = [];
            const totalHosts = hosts.length;
            let primarySSH;

            // Generate keyfile used for the internal authentication of the replica set
            const keyfile = await crypto.randomBytes(128).toString('hex');

            for (let hostNo = 0; hostNo < totalHosts; hostNo++) {
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

                    let files = [{
                        local: 'scripts/installDocker.sh',
                        remote: '/home/' + username + '/installDocker.sh'
                    },
                    {
                        local: 'scripts/createReplicaSetDB.sh',
                        remote: '/home/' + username + '/createReplicaSetDB.sh'
                    },
                    {
                        local: 'scripts/Dockerfile-RS',
                        remote: '/home/' + username + '/Dockerfile'
                    },
                    {
                        local: 'scripts/docker-compose-RS.yml',
                        remote: '/home/' + username + '/docker-compose.yml'
                    }];

                    files.push();

                    if (hostNo === 0) {
                        files.push({
                            local: 'scripts/setupReplicaSet.sh',
                            remote: '/home/' + username + '/setupReplicaSet.sh'
                        });
                    }

                    // Transfer necessary files
                    await ssh.putFiles(files);

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

                    // Send the keyfile to the server
                    result = await ssh.execCommand('echo ' + keyfile + ' > /home/' + username + '/mongo.key');
                    logger.log('info', result);

                    // Create MongoDB Server
                    args = [serverData.serverName, serverData.serverPorts[hostNo], serverData.rootUser, serverData.rootPass, serverData.mongoVersion, serverData.replicaSetName];
                    result = await ssh.exec('./createReplicaSetDB.sh', args, options);
                    logger.log('info', result);

                    // Delete the keyfile
                    args = ['-f', 'mongo.key'];
                    result = await ssh.exec('rm', args, options);
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

            logger.log('info', 'Created DBs');

            if (primarySSH) {
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
                for (let hostNo = 0; hostNo < totalHosts; hostNo++) {
                    const host = hosts[hostNo];
                    const port = serverData.serverPorts[hostNo];
                    let priority = 1;

                    // Set the first host as the primary
                    if (hostNo === 0) {
                        priority = 500;
                    }

                    membersList += '\t{ _id: ' + hostNo + ', host: \'' + host + ':' + port + '\', priority: ' + priority + ' }';

                    if (hostNo === totalHosts - 1) {
                        membersList += '\n';
                    }
                    else {
                        membersList += ',\n';
                    }
                }
                membersList += ']"';

                logger.log('info', membersList);

                result = await primarySSH.execCommand('echo -e ' + membersList + ' > membersList.txt');
                logger.log('info', result);

                args = [serverData.serverName, serverData.rootUser, serverData.rootPass, serverData.replicaSetName];
                result = await primarySSH.exec('./setupReplicaSet.sh', args, options);
                logger.log('info', result);

                primarySSH.dispose();
            }
            else {
                throw new Error('Primary ssh not found');
            }

            // Save Server to DB
            const database1 = {
                serverName: serverData.serverName,
                name: 'local',
                ip: hosts,
                port: serverData.serverPorts,
                users: {
                    username: serverData.rootUser,
                    password: serverData.rootPass
                },
                type: 'replica-set'
            };
            await db.addDBToUser(dbUsername, database1);

            const database2 = {
                serverName: serverData.serverName,
                name: 'admin',
                ip: hosts,
                port: serverData.serverPorts,
                users: {
                    username: serverData.rootUser,
                    password: serverData.rootPass
                },
                type: 'replica-set'
            };
            await db.addDBToUser(dbUsername, database2);
        }
        catch (err) {
            logger.log('error', err);
        }
    }
};
