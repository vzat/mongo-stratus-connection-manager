serverName=${1:-test}
serverPort=${2:-27017}
rootUser=${3:-admin}
rootPass=${4:-admin}
mongoVersion=${5:-latest}
replicaSetName=${6:-replicaSet}
confIP=${7:-configIP}
containerName=$serverName

# shards=`cat shards.txt`

echo "MONGO_INITDB_ROOT_USERNAME=$rootUser" > .env
echo "MONGO_INITDB_ROOT_PASSWORD=$rootPass" >> .env
echo "MONGO_VERSION=$mongoVersion" >> .env
echo "CONTAINER_NAME=$containerName" >> .env
echo "CONTAINER_PORT=$serverPort" >> .env
echo "REPLICA_SET_NAME=$replicaSetName" >> .env
echo "CONF_IP=$confIP" >> .env

sudo mkdir -p /data/db

sudo docker-compose build

sudo docker-compose up -d

sudo docker port $containerName

# # Add Shards to router
# while read -r shard
# do
#     sudo docker exec -t $containerName \
#         mongo --eval "sh.addShard('$shard');"
# done <<< "$shards"
#
# # Add Root User
# sudo docker exec -t $containerName \
#     mongo admin --eval " \
#         db.createUser({ \
#             user: '$rootUser', \
#             pwd: '$rootPass', \
#             roles: [{ \
#                 role: 'root', \
#                 db: 'admin' \
#             }] \
#         });"
