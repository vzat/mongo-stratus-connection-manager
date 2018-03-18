const express = require('express');

const logger = require('../../lib/logger');
const gcp = require('../../lib/cloud-platforms/gcp');
const db = require('../../lib/db');

const routes = express.Router();

routes.post('/valid/session', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        if (req.session.username && req.session.username !== '') {
            res.end(JSON.stringify({'ok': 1}));
        }
        else {
            res.end(JSON.stringify({'ok': 0, error: 'session'}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'error': err}));
    }
});

routes.get('/get/username', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.session.username && req.session.username !== '') {
        res.end(JSON.stringify({'ok': 1, 'username': req.session.username}));
    }
    else {
        res.end(JSON.stringify({'ok': 0}));
    }
});

routes.get('/exists/:username/:database', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const database = req.params.database;

        const status = await db.checkDBExists(username, database);

        if (status) {
            res.end(JSON.stringify({'ok': 1}));
        }
        else {
            res.end(JSON.stringify({'ok': 0}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'error': err}));
    }
});

routes.get('/:username/instances', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;

        const dbs = await db.getInstances(username);

        if (dbs) {
            res.end(JSON.stringify({
                'ok': 1,
                'data': dbs
            }));
        }
        else {
            res.end(JSON.stringify({'ok': 0}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'error': err}));
    }
});

routes.get('/:username/:instance/databases', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;

        const dbs = await db.getDatabases(username, instance);

        if (dbs) {
            res.end(JSON.stringify({
                'ok': 1,
                'data': dbs
            }));
        }
        else {
            res.end(JSON.stringify({'ok': 0}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'error': err}));
    }
});

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

routes.post('/create/shardedcluster/db', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.body.username;

        if (!username) throw new Error('Invalid username');

        // ServerInfo
        // ---> cloudPlatform
        // ---> regions
        // ------> configServers[]
        // ------> shards{}
        // ---------> shard1[]
        // ---------> shard2[]
        // ------> mongos[]
        // ---> machineTypes
        // ------> configServers[]
        // ------> shards{}
        // ---------> shard1[]
        // ---------> shard2[]
        // ------> mongos[]
        // ---> diskSizes
        // ------> configServers
        // ------> shards{}
        // ---------> shard1[]
        // ---------> shard2[]
        // ------> mongos
        const serverInfo = req.body.serverInfo;

        if (!serverInfo ||
            !serverInfo.cloudPlatform ||
            !serverInfo.regions ||
            !serverInfo.machineTypes ||
            !serverInfo.diskSizes)
            throw new Error('Invalid Server Info');


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
        const serverData = req.body.serverData;

        if (!serverData ||
            !serverData.serverName ||
            !serverData.serverPorts ||
            !serverData.rootUser ||
            !serverData.rootPass ||
            !serverData.mongoVersion)
            throw new Error('Invalid Server Data');

        if (serverInfo.cloudPlatform === 'gcp') {
            gcp.createShardedClusterDB(username, serverInfo.regions, serverInfo.machineTypes, serverInfo.diskSizes, serverData);
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
