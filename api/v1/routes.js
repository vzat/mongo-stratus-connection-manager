const express = require('express');

const logger = require('../../lib/logger');
const gcp = require('../../lib/cloud-platforms/gcp');

const routes = express.Router();

routes.port('/create/database', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.body.username;

        if (!username) throw new Error('Invalid username')

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
        }
        else {
            throw new Error('Invalid Cloud Platform');
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'error': err}));
    }
});

module.exports = routes;
