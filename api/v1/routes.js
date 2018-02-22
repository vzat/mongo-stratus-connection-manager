const express = require('express');

const logger = require('../../lib/logger');
const gcp = require('../../lib/cloud-platforms/gcp');

const routes = express.Router();

routes.post('/create/singlenode/db', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.body.username;

        if (!username) throw new Error('Invalid username');

        // ServerInfo
        // ---> cloudPlatform
        // ---> region
        // ---> machineType
        // ---> diskSize
        const serverInfo = req.body.serverInfo;

        if (!serverInfo ||
            !serverInfo.cloudPlatform ||
            !serverInfo.region ||
            !serverInfo.machineType ||
            !serverInfo.diskSize)
            throw new Error('Invalid Server Info');

        // ServerData
        // ---> serverName
        // ---> serverPort
        // ---> rootUser
        // ---> rootPass
        // ---> mongoVersion
        const serverData = req.body.serverData;

        if (!serverData ||
            !serverData.serverName ||
            !serverData.serverPort ||
            !serverData.rootUser ||
            !serverData.rootPass ||
            !serverData.mongoVersion)
            throw new Error('Invalid Server Data');

        if (serverInfo.cloudPlatform === 'gcp') {
            gcp.createSingleNodeDB(username, serverInfo.region, serverInfo.machineType, Number(serverInfo.diskSize), serverData);
            res.end(JSON.stringify({'ok': 1}));
        }
        else {
            throw new Error('Invalid Cloud Platform');
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'ok': 0, 'error': err}));
    }
});

routes.post('/create/replicaset/db', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.body.username;

        if (!username) throw new Error('Invalid username');

        // ServerInfo
        // ---> cloudPlatform
        // ---> regions[]
        // ---> machineTypes[]
        // ---> diskSize
        const serverInfo = req.body.serverInfo;

        if (!serverInfo ||
            !serverInfo.cloudPlatform ||
            !serverInfo.regions ||
            !serverInfo.machineTypes ||
            !serverInfo.diskSize)
            throw new Error('Invalid Server Info');


        // ServerData
        // ---> serverName
        // ---> serverPorts[]
        // ---> rootUser
        // ---> rootPass
        // ---> mongoVersion
        // ---> replicaSetName
        const serverData = req.body.serverData;

        if (!serverData ||
            !serverData.serverName ||
            !serverData.serverPorts ||
            !serverData.rootUser ||
            !serverData.rootPass ||
            !serverData.mongoVersion ||
            !serverData.replicaSetName)
            throw new Error('Invalid Server Data');

        // Check correct no of replicas
        if (!serverInfo.regions.length ||
            serverInfo.regions.length === 0 ||
            serverInfo.regions.length !== serverData.serverPorts.length ||
            serverInfo.regions.length !== serverInfo.machineTypes.length)
            throw new Error('Invalid Replica Set Data');

        if (serverInfo.cloudPlatform === 'gcp') {
            gcp.createReplicaSetDB(username, serverInfo.regions, serverInfo.machineTypes, Number(serverInfo.diskSize), serverData);
            res.end(JSON.stringify({'ok': 1}));
        }
        else {
            throw new Error('Invalid Cloud Platform');
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'ok': 0, 'error': err}));
    }
});

module.exports = routes;
