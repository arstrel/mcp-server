#!/bin/bash
# Load nvm and use the version specified in .nvmrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Change to the script's directory
cd "$(dirname "$0")"

# Use the Node.js version from .nvmrc if it exists, otherwise use default
if [ -f ".nvmrc" ]; then
    nvm use
else
    nvm use default
fi

# Run the server
exec node dist/server.js
