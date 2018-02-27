containerName=${1:-test}
rootUser=${3:-admin}
rootPass=${4:-admin}

shards=`cat shards.txt`

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
