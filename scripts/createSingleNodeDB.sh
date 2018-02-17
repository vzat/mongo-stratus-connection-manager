serverName=${1:-test}
serverPort=${2:-27017}
rootUser=${3:-admin}
rootPass=${4:-admin}
mongoVersion=${5:-latest}
containerName=$serverName

echo "MONGO_INITDB_ROOT_USERNAME=$rootUser" > .env
echo "MONGO_INITDB_ROOT_PASSWORD=$rootPass" >> .env
echo "MONGO_VERSION=$mongoVersion" >> .env
echo "CONTAINER_NAME=$containerName" >> .env
echo "CONTAINER_PORT=$serverPort" >> .env

sudo mkdir -p /data/db

sudo docker-compose up -d

sudo docker port $containerName
