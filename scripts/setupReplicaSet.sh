containerName=${1:-test}
rootUser=${2:-admin}
rootPass=${3:-admin}
replicaSetName=${4:-replicaSet}

members=`cat membersList.txt`


docker exec -t $containerName \
    mongo admin -u $rootUser -p $rootPass --eval " \
        rs.initiate({ \
            _id: '$replicaSetName', \
            members: $members
        })"




#
# docker exec -t repl0 \
#     mongo --eval " \
#     rs.initiate({ \
#         _id: 'rsTest', \
#         members: [ \
#             { _id: 0, host: '147.252.143.3:27017', priority: 500 }, \
#             { _id: 1, host: '147.252.143.3:27018', priority: 1 }, \
#             { _id: 2, host: '147.252.143.3:27019', priority: 1 }, \
#         ] \
#     })"
