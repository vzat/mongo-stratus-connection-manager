containerName=${1:-test}
rootUser=${2:-admin}
rootPass=${3:-admin}
replicaSetName=${4:-replicaSet}

members=`cat membersList.txt`

sleep 10

# Setup Replica Set
sudo docker exec -t $containerName \
    mongo --port 27019 --eval " \
        rs.initiate({ \
            _id: '$replicaSetName', \
            configsvr: true, \
            members: $members
        })"


# # Wait for Replica Set to setup
# notRunning='"ok" : 0'
#
# status=$(sudo docker exec -t $containerName \
#           mongo admin --port 27019 --eval "rs.status()")
#
# while [[ $status == *$notRunning* ]]
# do
#     echo "Waiting for replica set to finish setting up..."
#     sleep 5
#     status=$(sudo docker exec -t $containerName \
#               mongo admin --port 27019 --eval "rs.status()")
#     echo -e "$status"
# done


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
