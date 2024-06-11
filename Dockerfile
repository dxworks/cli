# Use the official Ubuntu image as the base
FROM ubuntu:latest

# Install curl, git, and required libraries for Chromium
RUN apt-get update && \
    apt-get install -y curl git wget \
    fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libatspi2.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 \
    libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 \
    xdg-utils libgbm1 lsb-release && \
    apt-get clean

# Install Chromium
RUN apt-get update && \
    apt-get install -y chromium-browser && \
    apt-get clean

# Install nvm, Node.js and npm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 18.12.1

RUN mkdir -p $NVM_DIR && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \
    . $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default

# Add nvm.sh to .bashrc for startup...
RUN echo "export NVM_DIR=\"$NVM_DIR\"" >> /etc/bash.bashrc && \
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm' >> /etc/bash.bashrc


# Set the working directory
WORKDIR /app

COPY docker/entrypoint.sh entrypoint.sh

RUN chmod +x ./entrypoint.sh

RUN /bin/bash -c ". $NVM_DIR/nvm.sh && ./entrypoint.sh"
