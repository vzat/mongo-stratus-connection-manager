containerName=${1:-test}
rootUser=${2:-admin}
rootPass=${3:-admin}

shards=`cat shards.txt`

sleep 10

# Add Shards to router
while read -r shard
do
    echo shard

    sudo docker exec -t $containerName \
        mongo --eval "sh.addShard('$shard');"
done <<< "$shards"

# Add Root User
sudo docker exec -t $containerName \
    mongo admin --eval " \
        db.createUser({ \
            user: '$rootUser', \
            pwd: '$rootPass', \
            roles: [{ \
                role: 'root', \
                db: 'admin' \
            }] \
        });"
