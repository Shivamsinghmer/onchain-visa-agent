FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --production=false

# Copy rest of the code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies (optional optimization)
RUN npm prune --production

EXPOSE 3000

# Start wrapper (HTTP server)
CMD ["node", "dist/wrapper/server.js"]