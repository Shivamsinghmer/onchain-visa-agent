FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Entry point for the wrapper service
CMD ["node", "dist/wrapper/server.js"]
