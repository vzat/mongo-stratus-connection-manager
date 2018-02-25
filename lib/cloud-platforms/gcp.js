const Compute = require('@google-cloud/compute');

const logger = require('../../lib/logger');
const ssh = require('../ssh');

const compute = new Compute({
    projectId: 'mongostratus',
    keyFilename: './keys/gcp/MongoStratus-d7746b382813.json'
});

const machineTypesHash = {
    'micro': 'f1-micro',
    'small': 'g1-small',
    'standard': 'n1-standard-1'
};

const regionsHash = {
    'us1': 'us-west1-a',
    'us2': 'us-central1-f',
    'us3': 'us-east1-b',

    'eu1': 'europe-west2-a',
    'eu2': 'europe-west4-b',
    'eu3': 'europe-west3-c'
};

// Ubuntu 16.04 LTS
const sourceImage = 'projects/ubuntu-os-cloud/global/images/family/ubuntu-1604-lts';

async function createServersForSH(username, regions, machineTypes, diskSize, serverData, compType) {
    try {
        // ServerData
        // ---> serverName
        // ---> mongoVersion

        let vmPromises = [];
        const totalVMs = regions.length;
        for (let vmNo = 0; vmNo < totalVMs; vmNo++) {
            const region = regions[vmNo];
            const machineType = machineTypes[vmNo];

            const zone = compute.zone(regionsHash[region]);

            const config = {
                machineType: machineTypesHash[machineType],
                disks: [{
                    boot: true,
                    autoDelete: true,
                    initializeParams: {
                        sourceImage: sourceImage,
                        diskSizeGb: diskSize
                    }
                }],
                networkInterfaces: [{
                    network: 'projects/mongostratus/global/networks/mongo-stratus',
                    accessConfigs: [{
                        type: 'ONE_TO_ONE_NAT'
                    }]
                }],
                metadata: [{
                    items: [{
                        key: 'username',
                        value: username
                    },
                    {
                        key: 'serverName',
                        value: serverData.serverName
                    },
                    {
                        key: 'dbType',
                        value: 'sharded-cluster'
                    },
                    {
                        key: 'compType',
                        value: compType
                    },
                    {
                        key:'mongoVersion',
                        value: serverData.mongoVersion
                    }]
                }]
            };

            const vmName = username + '-' + serverData.serverName + '-' + compType + '-' + vmNo;
            const promise = zone.createVM(vmName.toLowerCase(), config);
            vmPromises.push(promise);
        }

        // Wait for the VMs to be created
        const values = await Promise.all(vmPromises);

        return new Promise(resolve => {
            let extIPs = [];
            let noIPs = totalVMs;

            for (let vmNo = 0; vmNo < totalVMs; vmNo++) {
                const data = values[vmNo];

                const vm = data[0];
                const operation = data[1];

                operation.on('error', (err) => {
                    throw new Error(err);
                });

                operation.on('running', (metadata) => {
                    logger.log('info', metadata);
                });

                operation.on('complete', async (metadata) => {
                    logger.log('info', metadata);
                    const md = await vm.getMetadata();
                    logger.log('info', md);

                    // Get External IP and create MongoDB Server
                    if (md && md.length > 0 && md[0].networkInterfaces && md[0].networkInterfaces.length > 0 && md[0].networkInterfaces[0].accessConfigs && md[0].networkInterfaces[0].accessConfigs.length > 0) {
                        const extIP = md[0].networkInterfaces[0].accessConfigs[0].natIP;
                        extIPs[vmNo] = extIP;
                        noIPs--;
                        if (noIPs === 0) {
                            resolve(extIPs);
                        }
                    }
                    else {
                        throw new Error('Cannot get External IP');
                    }
                });
            }
        });
    }
    catch (err) {
        logger.log('error', err);
    }
}

module.exports = {
    createSingleNodeDB: async (username, region, machineType, diskSize, serverData) => {
        try {
            // serverData: {
            //     serverName,
            //     serverPort,
            //     rootUser,
            //     rootPass,
            //     mongoVersion
            // };

            const zone = compute.zone(regionsHash[region]);

            const config = {
                machineType: machineTypesHash[machineType],
                disks: [{
                    boot: true,
                    autoDelete: true,
                    initializeParams: {
                        sourceImage: sourceImage,
                        diskSizeGb: diskSize
                    }
                }],
                networkInterfaces: [{
                    network: 'projects/mongostratus/global/networks/mongo-stratus',
                    accessConfigs: [{
                        type: 'ONE_TO_ONE_NAT'
                    }]
                }],
                metadata: [{
                    items: [{
                        key: 'username',
                        value: username
                    },
                    {
                        key: 'serverName',
                        value: serverData.serverName
                    },
                    {
                        key: 'dbType',
                        value: 'single-node'
                    },
                    {
                        key:'mongoVersion',
                        value: serverData.mongoVersion
                    }]
                }]
            };

            const data = await zone.createVM(username + '-' + serverData.serverName, config);

            const vm = data[0];
            const operation = data[1];

            operation.on('error', (err) => {
                throw new Error(err);
            });

            operation.on('running', (metadata) => {
                logger.log('info', metadata);
            });

            operation.on('complete', async (metadata) => {
                logger.log('info', metadata);
                const md = await vm.getMetadata();
                logger.log('info', md);

                // Get External IP and create MongoDB Server
                if (md && md.length > 0 && md[0].networkInterfaces && md[0].networkInterfaces.length > 0 && md[0].networkInterfaces[0].accessConfigs && md[0].networkInterfaces[0].accessConfigs.length > 0) {
                    const extIP = md[0].networkInterfaces[0].accessConfigs[0].natIP;
                    await ssh.createSingleNodeDB(extIP, 'instance_admin', 'gcp/gcp-private.ppk', username, serverData);
                }
                else {
                    throw new Error('Cannot get External IP');
                }
            });
        }
        catch (err) {
            logger.log('error', err);
        }
    },
    createReplicaSetDB: async (username, regions, machineTypes, diskSize, serverData) => {
        try {
            // serverData: {
            //     serverName,
            //     serverPort[],
            //     rootUser,
            //     rootPass,
            //     mongoVersion
            //     replicaSetName
            // };

            let vmPromises = [];
            const totalVMs = regions.length;
            for (let vmNo = 0; vmNo < totalVMs; vmNo++) {
                const region = regions[vmNo];
                const machineType = machineTypes[vmNo];

                const zone = compute.zone(regionsHash[region]);

                const config = {
                    machineType: machineTypesHash[machineType],
                    disks: [{
                        boot: true,
                        autoDelete: true,
                        initializeParams: {
                            sourceImage: sourceImage,
                            diskSizeGb: diskSize
                        }
                    }],
                    networkInterfaces: [{
                        network: 'projects/mongostratus/global/networks/mongo-stratus',
                        accessConfigs: [{
                            type: 'ONE_TO_ONE_NAT'
                        }]
                    }],
                    metadata: [{
                        items: [{
                            key: 'username',
                            value: username
                        },
                        {
                            key: 'serverName',
                            value: serverData.serverName
                        },
                        {
                            key: 'dbType',
                            value: 'replica-set'
                        },
                        {
                            key:'mongoVersion',
                            value: serverData.mongoVersion
                        }]
                    }]
                };

                const vmName = username + '-' + serverData.serverName + '-' + vmNo;
                const promise = zone.createVM(vmName.toLowerCase(), config);
                vmPromises.push(promise);
            }

            // Wait for the VMs to be created
            const values = await Promise.all(vmPromises);

            const extIPs = await new Promise(resolve => {
                let extIPs = [];
                let noIPs = totalVMs;

                for (let vmNo = 0; vmNo < totalVMs; vmNo++) {
                    const data = values[vmNo];

                    const vm = data[0];
                    const operation = data[1];

                    operation.on('error', (err) => {
                        throw new Error(err);
                    });

                    operation.on('running', (metadata) => {
                        logger.log('info', metadata);
                    });

                    operation.on('complete', async (metadata) => {
                        logger.log('info', metadata);
                        const md = await vm.getMetadata();
                        logger.log('info', md);

                        // Get External IP and create MongoDB Server
                        if (md && md.length > 0 && md[0].networkInterfaces && md[0].networkInterfaces.length > 0 && md[0].networkInterfaces[0].accessConfigs && md[0].networkInterfaces[0].accessConfigs.length > 0) {
                            const extIP = md[0].networkInterfaces[0].accessConfigs[0].natIP;
                            extIPs[vmNo] = extIP;
                            noIPs--;
                            if (noIPs === 0) {
                                resolve(extIPs);
                            }
                        }
                        else {
                            throw new Error('Cannot get External IP');
                        }
                    });
                }
            });

            // After all the External IPs have been retrieved
            if (extIPs && extIPs.length === totalVMs) {
                await ssh.createReplicaSetDB(extIPs, 'instance_admin', 'gcp/gcp-private.ppk', username, serverData);
            }
        }
        catch (err) {
            logger.log('error', err);
        }
    },
    createShardedClusterDB: async (username, regions, machineTypes, diskSizes, serverData) => {
        try {
            // ServerData
            // ---> serverName
            // ---> serverPorts
            // ------> configServers[]
            // ------> shards{}
            // ---------> shard1[]
            // ---------> shard2[]
            // ------> mongos[]
            // ---> rootUser
            // ---> rootPass
            // ---> mongoVersion

            // Create Config Server Replica Set
            const configIPs = await createServersForSH(username, regions.configServers, machineTypes.configServers, diskSizes.configServers, serverData, 'config');

            // Create a Replica Set for each Shard
            let shardsIPs = [];
            for (const shard in regions.shards) {
                const shardRegions = regions.shards[shard];
                const shardMachineTypes = machineTypes.shards[shard];
                const shardDiskSize = diskSizes.shards[shard];

                const shardIPs = await createServersForSH(username, shardRegions, shardMachineTypes, shardDiskSize, serverData, shard);
                shardsIPs.push(shardIPs);
            }

            // Create Mongos Servers
            const mongosIPs = await createServersForSH(username, regions.mongos, machineTypes.mongos, diskSizes.mongos, serverData, 'mongos');

            console.log('ConfigIPs', configIPs);
            console.log('ShardsIPs', shardsIPs);
            console.log('MongosIPs', mongosIPs);
        }
        catch (err) {
            logger.log('error', err);
        }
    }
};
