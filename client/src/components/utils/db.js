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
    deleteInstance: async (username, instance) => {
        const res = await fetch('/api/v1/internal/' + username + '/' + instance + '/delete', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await res.json();
    }
};

export default db;
