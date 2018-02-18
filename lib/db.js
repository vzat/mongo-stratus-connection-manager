const config = require('config');
const request = require('request-promise');

const logger = require('logger');

const protocol = 'http://';

module.exports = {
    addDBToUser: async (username, database) => {
        try {
            const dataRetriever = config.services['mongo-stratus-data-retriever'];

            const query = `query GetUser ($username: String) {
                getAccounts (query: {username: $username}) {
                    username
                    password
                    email
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
                    dbList.push(database);

                    const mutation = `mutation AddDatabase ($username, $token, $databases) {
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
