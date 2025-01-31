#!/bin/bash

# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker and Docker Compose
sudo apt-get install -y docker.io
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Create app directory
mkdir -p ~/app
cd ~/app

# Copy application files
# Note: You'll need to manually SCP your files to the server

# Install dependencies
npm install

# Start the application using Docker Compose
sudo docker-compose up -d

# Install PM2 for Node.js process management
sudo npm install -g pm2

# Start the Node.js application with PM2
pm2 start index.js
pm2 startup
pm2 save 