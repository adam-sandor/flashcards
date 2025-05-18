FROM node:20-alpine

WORKDIR /app

# Copy package files for backend
COPY package*.json ./
RUN npm install

# Copy package files for frontend and install dependencies
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install

# Copy all source files
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/client
RUN npm run build

# Build backend
WORKDIR /app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"] 