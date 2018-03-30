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

routes.get('/show/notification', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        if (req.session.creatingInstance !== undefined && req.session.creatingInstance === true) {
            // An instance is being created
            const username = req.session.username;
            const instance = req.session.instanceName;
            const status = await db.checkDBExists(username, instance);

            if (status) {
                req.session.creatingInstance = false;
                res.end(JSON.stringify({'ok': 1, 'notification': 0, 'refresh': 1}));
            }
            else {
                res.end(JSON.stringify({'ok': 1, 'notification': 1}));
            }
        }
        else {
            res.end(JSON.stringify({'ok': 1, 'notification': 0}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'ok': 0, 'error': err}));
    }
});

routes.post('/hide/notification', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    req.session.creatingInstance = false;

    res.end(JSON.stringify({'ok': 1}));
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

routes.get('/:username/:instance/info', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;

        const data = await db.getInstanceData(username, instance);

        if (data) {
            res.end(JSON.stringify({
                'ok': 1,
                'data': data
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

routes.get('/:username/:instance/servers/info', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;

        const instanceData = await db.getInstanceData(username, instance);

        let data;
        if (instanceData[0].platform === 'gcp') {
            data = await gcp.getVMsDetails(username, instance);
        }

        if (data) {
            res.end(JSON.stringify({
                'ok': 1,
                'data': data
            }));
        }
        else {
            res.end(JSON.stringify({'ok': 0}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'ok': 0, 'error': err}));
    }
});

routes.get('/:username/:instance/databases', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;
        const token = req.session.token;

        const dbs = await db.getDatabases(username, instance, token);

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

routes.get('/:username/:instance/users', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;
        const token = req.session.token;

        const users = await db.getUsers(username, instance, token);

        if (users) {
            res.end(JSON.stringify({
                'ok': 1,
                'data': users
            }));
        }
        else {
            res.end(JSON.stringify({'ok': 0}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'ok': 0, 'error': err}));
    }
});

routes.post('/:username/:instance/:database/create', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;
        const database = req.params.database;
        const token = req.session.token;

        const success = await db.createDatabase(username, instance, database, token);

        if (success) {
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

routes.delete('/:username/:instance/:database/delete', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;
        const database = req.params.database;
        const token = req.session.token;

        const success = await db.deleteDatabase(username, instance, database, token);

        if (success) {
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

routes.put('/:username/:instance/:database/schema', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;
        const database = req.params.database;
        const schema = req.body.schema;
        const token = req.session.token;

        const success = await db.editSchema(username, instance, database, token, schema);

        if (success) {
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

routes.get('/:username/:instance/:database/schema', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;
        const database = req.params.database;

        const schema = await db.getSchema(username, instance, database);

        if (schema) {
            res.end(JSON.stringify({'ok': 1, 'schema': schema}));
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

routes.delete('/:username/:instance', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;

        const success = await db.removeInstanceFromUser(username, instance);

        if (success) {
            res.end(JSON.stringify({'ok': 1}));
        }
        else {
            res.end(JSON.stringify({'ok': 0}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'ok': 0, 'error': err}));
    }
});

routes.post('/:username/:instance/user', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;
        const data = req.body.data;
        const token = req.session.token;

        const success = await db.addUser(username, instance, token, data);

        if (success) {
            res.end(JSON.stringify({'ok': 1}));
        }
        else {
            res.end(JSON.stringify({'ok': 0}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'ok': 0, 'error': err}));
    }
});

routes.delete('/:username/:instance/:user/user', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;
        const user = req.params.user;
        const token = req.session.token;

        const success = await db.removeUser(username, instance, user, token);

        if (success) {
            res.end(JSON.stringify({'ok': 1}));
        }
        else {
            res.end(JSON.stringify({'ok': 0}));
        }
    }
    catch (err) {
        logger.log('error', err);
        res.end(JSON.stringify({'ok': 0, 'error': err}));
    }
});

routes.get('/:username/:instance/backups', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const username = req.params.username;
        const instance = req.params.instance;
        const token = req.session.token;

        const dbs = await db.getBackups(username, instance, token);

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
        res.end(JSON.stringify({'ok': 0, 'error': err}));
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

        // Store instance in cookies
        req.session.creatingInstance = true;
        req.session.instanceName = serverData.serverName;

        if (serverInfo.cloudPlatform === 'gcp') {
            gcp.createSingleNodeDB(username, serverInfo.region, serverInfo.machineType, Number(serverInfo.diskSize), serverData);
            res.end(JSON.stringify({'ok': 1}));
        }
        else {
            throw new Error('Invalid Cloud Platform');
        }
    }
    catch (err) {
        req.session.creatingInstance = false;
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
