const config = require('config');
const request = require('request-promise');

const logger = require('./logger');

const protocol = 'http://';

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
    createDatabase: async (username, instance, database, token) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const mutation = `mutation CreateDatabase ($name: String) {
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
    }
};
