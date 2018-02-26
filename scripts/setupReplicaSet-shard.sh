containerName=${1:-test}
rootUser=${2:-admin}
rootPass=${3:-admin}
replicaSetName=${4:-replicaSet}

members=`cat membersList.txt`

# Setup Replica Set
sudo docker exec -t $containerName \
    mongo --port 27018 --eval " \
        rs.initiate({ \
            _id: '$replicaSetName', \
            members: $members
        })"


# Wait for Replica Set to setup
running='"ok" : 1'

status=$(sudo docker exec -t $containerName \
          mongo admin --port 27018 --eval "rs.status()")

while [[ $status != *$running* ]]
do
    echo "Waiting for replica set to finish setting up..."
    sleep 5
    status=$(sudo docker exec -t $containerName \
              mongo admin --port 27018 --eval "rs.status()")
done


# # Create Root User
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
