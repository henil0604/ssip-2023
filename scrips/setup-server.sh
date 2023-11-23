# update
sudo apt update -y

# upgrade
sudo apt upgrade -y

# install nginx
sudo apt install -y nginx

# install nvm
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | sudo bash

# load nvm
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# install node
nvm install 20.8.1
nvm use 20.8.1

# install pnpm & pm2
npm install -g pnpm pm2

pnpm setup
pnpm install

# build
pnpm run build

# Function to add Nginx proxy configuration
add_nginx_proxy() {
    # Check if both arguments are provided
    if [ "$#" -ne 2 ]; then
        echo "Usage: add_nginx_proxy <source_port> <target_port> <domain>"
        return 1
    fi

    # Assign arguments to variables
    local sourcePort=$1
    local targetPort=$2
    local domain=$3

    # Create a basic Nginx configuration
    local config="server {
        listen $targetPort;
        server_name $domain;

        location / {
            proxy_pass http://127.0.0.1:$sourcePort;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }"

    # Save the configuration to a file
    local config_file="/etc/nginx/sites-available/$domain"
    echo "$config" | sudo tee "$config_file" > /dev/null

    # Create a symbolic link to enable the site
    sudo ln -s "$config_file" "/etc/nginx/sites-enabled/"

    # Test Nginx configuration and reload if successful
    sudo nginx -t && sudo systemctl reload nginx

    echo "Proxy configuration for $domain on port $sourcePort has been added at port $targetPort."
}

local SOURCE_PORT=3001
local TARGET_PORT=80
local DOMAIN="varnantar.henil.xyz"

add_nginx_proxy $SOURCE_PORT $TARGET_PORT $DOMAIN

# start pm2 process
pm2 start npm --name "varnantar" -- run preview

echo "DONE"