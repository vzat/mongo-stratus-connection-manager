const Compute = require('@google-cloud/compute');

const logger = require('../../lib/logger');

const compute = new Compute({
    projectId: 'mongostratus',
    keyFilename: './keys/gcp/MongoStratus-d7746b382813.json'
});
const project = compute.project('mongostratus');

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

// Ubuntu 16.04
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
            const apiResponse = data[2];

            console.log('vm', vm);
            console.log('operation', operation);
            console.log('apiResponse', apiResponse);

            operation.on('error', (err) => {
                throw new Error(err);
            });
            operation.on('running', (metadata) => {
                console.log('op-running', metadata);
            });
            operation.on('complete', (metadata) => {
                console.log('op-complete', metadata);
            });
        }
        catch (err) {
            console.log('err', err);
        }
    }
};
