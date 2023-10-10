sudo yum install jq -y
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
docker compose version

cat << EOF >> /home/ec2-user/.bashrc
export PATH=$PATH:$HOME/.local/bin:$HOME/bin:/usr/local/bin:/usr/bin
EOF

source /home/ec2-user/.bashrc
curl -L https://raw.githubusercontent.com/docker/compose-cli/main/scripts/install/install_linux.sh | sh
