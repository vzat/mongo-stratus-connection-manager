#!/bin/sh

username=${1:-admin}
dbName=${2:-test}
dbUser=${3:-user}
dbPass=${4:-pass}
role=${5:-readWrite}
rootUser='root'
rootPass='root'
containerName=$username-$dbName

docker exec -t $containerName \
    mongo admin -u $rootUser -p $rootPass --eval \
    db.createUser({ \
        user: '$dbUser', \
        pwd: '$dbPass', \
        roles: [{ \
            role: '$role', \
            db: '$dbName' \
        }] \
      });"
