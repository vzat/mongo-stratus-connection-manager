containerName=${1:-test}
rootUser=${2:-admin}
rootPass=${3:-admin}
replicaSetName=${4:-replicaSet}

members=`cat membersList.txt`

# Setup Replica Set
sudo docker exec -t $containerName \
    mongo --eval " \
        rs.initiate({ \
            _id: '$replicaSetName', \
            members: $members
        })"

sudo docker exec -t $containerName \
    mongo admin --eval " \
    db.admin.find({})"

# Create Root User
sudo docker exec -t $containerName \
    mongo admin --eval " \
        db.createUser({ \
            user: '$rootUser', \
            pwd: '$rootPass', \
            roles: [{ \
                role: 'root', \
                db: 'admin' \
            }] \
        })"
