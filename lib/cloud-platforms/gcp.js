const Compute = require('@google-cloud/compute');

const logger = require('../../lib/logger');
const ssh = require('../ssh');

const compute = new Compute({
    projectId: 'mongostratus',
    keyFilename: './keys/gcp/MongoStratus-d7746b382813.json'
});

const machineTypes = {
    'micro': 'f1-micro',
    'small': 'g1-small',
    'standard': 'n1-standard-1'
};

const regions = {
    'us1': 'us-west1-a',
    'us2': 'us-central1-f',
    'us3': 'us-east1-b',

    'eu1': 'europe-west2-a',
    'eu2': 'europe-west4-b',
    'eu3': 'europe-west3-c'
};

// Ubuntu 16.04 LTS
const sourceImage = 'projects/ubuntu-os-cloud/global/images/family/ubuntu-1604-lts';

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

            const zone = compute.zone(regions[region]);

            const config = {
                machineType: machineTypes[machineType],
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
    }
};
