# Install docker
sudo apt-get update && \

sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common && \

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - && \

sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable" && \

sudo apt-get update && \

sudo apt-get install -y docker-ce && \


# Install docker-compose
sudo curl -L https://github.com/docker/compose/releases/download/1.19.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose && \
sudo chmod +x /usr/local/bin/docker-compose && \


# Run docker and docker-compose without sudo
# https://askubuntu.com/questions/477551/how-can-i-use-docker-without-sudo
sudo gpasswd -a $USER docker && \

# Test Docker
sudo docker --version && \
sudo docker-compose --version
