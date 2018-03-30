const db = {
    createSingleNode: async (data) => {
        const res = await fetch('/api/v1/internal/create/singlenode/db', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        });

        return await res.json();
    },
    createReplicaSet: async (data) => {
        const res = await fetch('/api/v1/internal/create/replicaset/db', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        });

        return await res.json();
    },
    getInstances: async (username) => {
        const res = await fetch('/api/v1/internal/' + username + '/instances', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    getDatabases: async (username, instance) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/databases', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    getUsers: async (username, instance) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/users', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    createDatabase: async (username, instance, database) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/' + database + '/create', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    addUser: async (username, instance, data) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/' + '/user', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        });

        return await res.json();
    },
    removeUser: async (username, instance, user) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/' + user + '/user', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    deleteDatabase: async (username, instance, database) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/' + database + '/delete', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    deleteInstance: async (username, instance) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    getInstanceData: async (username, instance) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/info', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    getServerDetails: async (username, instance) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/servers/info', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    editSchema: async (username, instance, database, schema) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/' + database + '/schema', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: schema
        });

        return await res.json();
    },
    getSchema: async (username, instance, database) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/' + database + '/schema', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    getBackups: async (username, instance) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/backups', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    backup: async (username, instance) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/backup', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    },
    restore: async (username, instance, timestamp) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/restore/' + timestamp, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    }
};

export default db;
