FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create data directory for database
RUN mkdir -p data

EXPOSE 3001

CMD ["node", "server.js"]
