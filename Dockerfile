FROM node:18-alpine

WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY index.js ./

# Create data directory for persistence
RUN mkdir -p /app/data && chmod 777 /app/data

EXPOSE 3000

CMD ["npm", "start"]