const config = require('config');
const request = require('request-promise');

const logger = require('./logger');

const protocol = 'http://';

async function graphqlRequest (query, variables, endpoint, token) {
    const dataRetriever = config.services['mongo-stratus-data-retriever'];

    let options = {
        method: 'POST',
        uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + endpoint,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };

    const json = await request.post(options);
    return await JSON.parse(json);
};

module.exports = {
    addDBToUser: async (username, database) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetUser ($username: String) {
                getAccounts (query: {username: $username}) {
                    username
                    token
                    databases {
                        serverName
                        name
                        ip
                        port
                        users {
                            username
                            password
                        }
                        type
                        platform
                        version
                        schema
                    }
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        'username': username
                    }
                })
            };

            const usersJSON = await request.post(options);
            const usersRes = await JSON.parse(usersJSON);
            const accounts = usersRes.data.getAccounts;

            for (const accountNo in accounts) {
                const account = accounts[accountNo];
                if (account.username === username) {
                    let dbList = account.databases;
                    if (dbList && dbList.length > 0) {
                        dbList.push(database);
                    }
                    else {
                        dbList = [database];
                    }

                    const mutation = `mutation AddDatabase ($username: String, $token: String, $databases: [DatabaseInput]) {
                        updateAccounts (filter: {username: $username, token: $token}, update: {databases: $databases}) {
                            username
                        }
                    }`;

                    options = {
                        method: 'POST',
                        uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                        },
                        body: JSON.stringify({
                            query: mutation,
                            variables: {
                                'username': username,
                                'token': account.token,
                                'databases': dbList
                            }
                        })
                    };

                    const responseJSON = await request.post(options);
                    const response = await JSON.parse(responseJSON);

                    if (Object.keys(response) === 0 || Object.keys(response.data) === 0 || Object.keys(response.data.updateAccounts) === 0) {
                        throw new Error('No Data Received');
                    }

                    const updatedAccounts = response.data.updateAccounts;

                    if (updatedAccounts.length === 1) {
                        return true;
                    }

                    return false;
                }
            }
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    checkDBExists: async (username, database) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetDatabases ($username: String) {
                getAccounts (query: {username: $username}) {
                    username
                    databases {
                        serverName
                    }
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        'username': username
                    }
                })
            };

            const usersJSON = await request.post(options);
            const usersRes = await JSON.parse(usersJSON);
            const accounts = usersRes.data.getAccounts;

            for (const accountNo in accounts) {
                const account = accounts[accountNo];
                if (account.username === username) {
                    for (const dbNo in account.databases) {
                        if (account.databases[dbNo].serverName === database) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    getInstances: async (username) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetInstances ($username: String) {
                getAccounts (query: {username: $username}) {
                    username
                    databases {
                        serverName
                        type
                        platform
                    }
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        'username': username
                    }
                })
            };

            const usersJSON = await request.post(options);
            const usersRes = await JSON.parse(usersJSON);
            const accounts = usersRes.data.getAccounts;

            let dbs = [];
            let dbNames = [];
            for (const accountNo in accounts) {
                const account = accounts[accountNo];
                if (account.username === username) {

                    for (const dbNo in account.databases) {
                        const database = account.databases[dbNo];

                        // Check if the db exists in the array
                        if (dbNames.indexOf(database.serverName) === -1) {
                            const db = {
                                serverName: database.serverName,
                                type: database.type,
                                platform: database.platform
                            };
                            dbs.push(db);
                            dbNames.push(db.serverName);
                        }
                    }
                    return dbs;
                }
            }
            return dbs;
        }
        catch (err) {
            logger.log('error', err);
            return undefined;
        }
    },
    getInstanceData: async (username, instanceName) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetInstances ($username: String) {
                getAccounts (query: {username: $username}) {
                    username
                    databases {
                        ip
                        port
                        serverName
                        type
                        platform
                        version
                        schema
                    }
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        'username': username
                    }
                })
            };

            const usersJSON = await request.post(options);
            const usersRes = await JSON.parse(usersJSON);
            const accounts = usersRes.data.getAccounts;

            let dbs = [];
            for (const accountNo in accounts) {
                const account = accounts[accountNo];
                if (account.username === username) {

                    for (const dbNo in account.databases) {
                        const database = account.databases[dbNo];

                        if (database.serverName === instanceName) {
                            dbs.push(database);
                        }
                    }
                    return dbs;
                }
            }
            return dbs;
        }
        catch (err) {
            logger.log('error', err);
            return undefined;
        }
    },
    getDatabases: async (username, instance, token) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetDatabases {
                getDatabases {
                    name
                    sizeOnDisk
                    empty
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    query: query
                })
            };

            const usersJSON = await request.post(options);
            const usersRes = await JSON.parse(usersJSON);
            const databases = usersRes.data.getDatabases;

            return databases;
        }
        catch (err) {
            logger.log('error', err);
            return undefined;
        }
    },
    getUsers: async (username, instance, token) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetUsers {
                getUsers {
                    user
                    db
                    roles {
                        role
                        db
                    }
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    query: query
                })
            };

            const usersJSON = await request.post(options);
            const usersRes = await JSON.parse(usersJSON);
            const users = usersRes.data.getUsers;

            return users;
        }
        catch (err) {
            logger.log('error', err);
            return undefined;
        }
    },
    createDatabase: async (username, instance, database, token) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const mutation = `mutation CreateDatabase ($name: String!) {
                createDatabase (name: $name)
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: {
                        name: database
                    }
                })
            };

            const resJSON = await request.post(options);
            const res = await JSON.parse(resJSON);

            const dbName = res.data.createDatabase;

            if (dbName === database) {
                return true;
            }

            return false;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    deleteDatabase: async (username, instance, database, token) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const mutation = `mutation DropDatabase ($name: String!) {
                dropDatabase (name: $name)
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: {
                        name: database
                    }
                })
            };

            const resJSON = await request.post(options);
            const res = await JSON.parse(resJSON);

            const dbName = res.data.dropDatabase;

            if (dbName === database) {
                return true;
            }

            return false;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    removeInstanceFromUser: async (username, instanceName) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetUser ($username: String) {
                getAccounts (query: {username: $username}) {
                    username
                    token
                    databases {
                        serverName
                        name
                        ip
                        port
                        users {
                            username
                            password
                        }
                        type
                        platform
                        version
                        schema
                    }
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        'username': username
                    }
                })
            };

            const usersJSON = await request.post(options);
            const usersRes = await JSON.parse(usersJSON);
            const accounts = usersRes.data.getAccounts;

            for (const accountNo in accounts) {
                const account = accounts[accountNo];
                if (account.username === username) {

                    // Remove dbs from the instance
                    const dbList = account.databases.filter(db => db.serverName !== instanceName);
                    const removedDBs = account.databases.filter(db => db.serverName === instanceName);

                    if (removedDBs && removedDBs.length > 0) {

                        // Delete VMs from the Cloud Platform
                        switch (removedDBs[0].platform) {
                        case 'gcp':
                            await require('./cloud-platforms/gcp').deleteVMs(username, instanceName);
                            break;
                        default:
                            break;
                        }
                    }

                    const mutation = `mutation AddDatabase ($username: String, $token: String, $databases: [DatabaseInput]) {
                        updateAccounts (filter: {username: $username, token: $token}, update: {databases: $databases}) {
                            username
                        }
                    }`;

                    options = {
                        method: 'POST',
                        uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                        },
                        body: JSON.stringify({
                            query: mutation,
                            variables: {
                                'username': username,
                                'token': account.token,
                                'databases': dbList
                            }
                        })
                    };

                    const responseJSON = await request.post(options);
                    const response = await JSON.parse(responseJSON);

                    if (Object.keys(response) === 0 || Object.keys(response.data) === 0 || Object.keys(response.data.updateAccounts) === 0) {
                        throw new Error('No Data Received');
                    }

                    const updatedAccounts = response.data.updateAccounts;

                    if (updatedAccounts.length === 1) {
                        return true;
                    }

                    return false;
                }
            }
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    editSchema: async (username, instance, database, token, schema) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetUser ($username: String) {
                getAccounts (query: {username: $username}) {
                    username
                    token
                    databases {
                        serverName
                        name
                        ip
                        port
                        users {
                            username
                            password
                        }
                        type
                        platform
                        version
                        schema
                    }
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        'username': username
                    }
                })
            };

            const usersJSON = await request.post(options);
            const usersRes = await JSON.parse(usersJSON);
            const accounts = usersRes.data.getAccounts;

            for (const accountNo in accounts) {
                const account = accounts[accountNo];
                if (account.username === username) {
                    let dbList = account.databases;
                    let dbLength = dbList.length;

                    if (dbList && dbList.length > 0) {
                        let newDB;
                        for (const dbNo in dbList) {
                            const db = dbList[dbNo];

                            // Do not create db if it already exists
                            if (db.serverName === instance && db.name === database) {
                                newDB = undefined;
                                break;
                            }

                            // Get a copy of a database from the same instance
                            if (db.serverName === instance) {
                                newDB = { ...db };
                                newDB.name = database;
                            }
                        }

                        if (newDB !== undefined) {
                            dbList.push(newDB);

                            const mutation = `mutation AddDatabase ($username: String, $token: String, $databases: [DatabaseInput]) {
                                updateAccounts (filter: {username: $username, token: $token}, update: {databases: $databases}) {
                                    username
                                }
                            }`;

                            options = {
                                method: 'POST',
                                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                                },
                                body: JSON.stringify({
                                    query: mutation,
                                    variables: {
                                        'username': username,
                                        'token': account.token,
                                        'databases': dbList
                                    }
                                })
                            };

                            const responseJSON = await request.post(options);
                            const response = await JSON.parse(responseJSON);

                            if (Object.keys(response) === 0 || Object.keys(response.data) === 0 || Object.keys(response.data.updateAccounts) === 0) {
                                throw new Error('No Data Received');
                            }
                        }
                    }

                    // If the user is found, ignore the rest
                    break;
                }
            }

            options = {
                method: 'PUT',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance + '/' + database + '/schema',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    schema: schema
                })
            };

            const resJSON = await request.put(options);
            const res = await JSON.parse(resJSON);

            if (res.error && res.error === 0) {
                return true;
            }
            else {
                logger.log('error', res);
                return false;
            }
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    getSchema: async (username, instanceName, databaseName) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetSchema ($username: String) {
                getAccounts (query: {username: $username}) {
                    username
                    databases {
                        serverName
                        name
                        schema
                    }
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        'username': username
                    }
                })
            };

            const usersJSON = await request.post(options);
            const usersRes = await JSON.parse(usersJSON);
            const accounts = usersRes.data.getAccounts;

            for (const accountNo in accounts) {
                const account = accounts[accountNo];
                if (account.username === username) {

                    for (const dbNo in account.databases) {
                        const database = account.databases[dbNo];

                        if (database.serverName === instanceName && database.name === databaseName) {
                            return database.schema;
                        }
                    }
                    throw new Error('Cannot find database');
                }
            }
            throw new Error('Cannot find user');
        }
        catch (err) {
            logger.log('error', err);
            return undefined;
        }
    },
    addUser: async (username, instance, token, data) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const mutation = `mutation AddUser ($userData: UserInput!) {
                addUser (user: $userData)
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: {
                        userData: data
                    }
                })
            };

            const resJSON = await request.post(options);
            const res = await JSON.parse(resJSON);

            const addedUser = res.data.addUser;

            if (addedUser === data.user) {
                return true;
            }

            return false;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    removeUser: async (username, instance, user, token) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const mutation = `mutation RemoveUser ($user: String!) {
                removeUser (username: $user)
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: {
                        user: user
                    }
                })
            };

            const resJSON = await request.post(options);
            const res = await JSON.parse(resJSON);

            const removedUser = res.data.removeUser;

            if (removedUser === user) {
                return true;
            }

            return false;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    getBackups: async (username, instance, token) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetBackups {
                getBackups {
                    timestamp
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    query: query
                })
            };

            const backupsJSON = await request.post(options);
            const backupsRes = await JSON.parse(backupsJSON);
            const backups = backupsRes.data.getBackups;

            return backups;
        }
        catch (err) {
            logger.log('error', err);
            return undefined;
        }
    },
    backup: async (username, instance, token) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const mutation = `mutation Backup {
                backup
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    query: mutation
                })
            };

            const backupJSON = await request.post(options);
            const res = await JSON.parse(backupJSON);

            return res.data.backup;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    restore: async (username, instance, timestamp, token) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const mutation = `mutation Restore ($timestamp: String!) {
                restore (timestamp: $timestamp)
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/' + username + '/' + instance,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: {
                        timestamp: timestamp
                    }
                })
            };

            const restoreJSON = await request.post(options);
            const res = await JSON.parse(restoreJSON);

            return res.data.restore;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    getScheduledBackup: async (username, instance) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetScheduledBackup ($username: String, $instance: String) {
                getBackups (query: {username: $username, instance: $instance}) {
                    username
                    instance
                    time
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        'username': username,
                        'instance': instance
                    }
                })
            };

            const backupsJSON = await request.post(options);
            const backupsRes = await JSON.parse(backupsJSON);
            const res = backupsRes.data.getBackups;

            for (const backupNo in res) {
                const backup = res[backupNo];
                if (backup.username === username && backup.instance === instance) {
                    return backup.time;
                }
            }

            return false;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    setScheduledBackup: async (username, instance, time) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetScheduledBackup ($username: String, $instance: String) {
                getBackups (query: {username: $username, instance: $instance}) {
                    _id
                    username
                    instance
                    time
                }
            }`;

            let options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        'username': username,
                        'instance': instance
                    }
                })
            };

            const backupsJSON = await request.post(options);
            const backupsRes = await JSON.parse(backupsJSON);
            const backups = backupsRes.data.getBackups;

            for (const backupNo in backups) {
                const backup = backups[backupNo];
                if (backup.username === username && backup.instance === instance) {
                    const mutation = `mutation UpdateScheduledBackup ($id: ID, $time: String) {
                        updateBackups (filter: {_id: $id}, update: {time: $time}) {
                            _id
                        }
                    }`;

                    options = {
                        method: 'POST',
                        uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                        },
                        body: JSON.stringify({
                            query: mutation,
                            variables: {
                                'id': backup._id,
                                'time': time
                            }
                        })
                    };

                    const updateJSON = await request.post(options);
                    const updateRes = await JSON.parse(updateJSON);
                    const updates = updateRes.data.updateBackups;

                    if (updates.length > 0 && updates[0]._id === backup._id) {
                        return true;
                    }

                    return false;
                }
            }

            const mutation = `mutation InsertScheduledBackup ($username: String, $instance: String, $time: String) {
                insertBackups (docs: [{username: $username, instance: $instance, time: $time}]) {
                    username
                    instance
                }
            }`;

            options = {
                method: 'POST',
                uri: protocol + dataRetriever.ip + ':' + dataRetriever.port + '/api/v1/admin/mongoStratus/mongoStratus',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (process.env.APIToken || 'z321')
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: {
                        username: username,
                        instance: instance,
                        time: time
                    }
                })
            };

            const insertJSON = await request.post(options);
            const insertRes = await JSON.parse(insertJSON);
            const inserts = insertRes.data.insertBackups;

            if (inserts.username === username && inserts.instance === instance) {
                return true;
            }

            return false;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    getToken: async (username) => {
        try {
            const query = `query GetToken ($username: String) {
                getAccounts (query: {username: $username}) {
                    username
                    token
                }
            }`;

            const variables = {
                username: username
            };

            const res = await graphqlRequest(query, variables, '/api/v1/admin/mongoStratus/mongoStratus', (process.env.APIToken || 'z321'));
            const accounts = res.data.getAccounts;

            for (const accountNo in accounts) {
                const account = accounts[accountNo];

                if (account.username === username) {
                    return account.token;
                }
            }

            throw new Error('Cannot find user ' + username);
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    },
    refreshToken: async (username, token) => {
        try {
            const query = `mutation RefreshToken {
                refreshToken
            }`;

            const res = await graphqlRequest(query, {}, '/api/v1/' + username, token);
            return res.data.refreshToken;
        }
        catch (err) {
            logger.log('error', err);
            return false;
        }
    }
};
