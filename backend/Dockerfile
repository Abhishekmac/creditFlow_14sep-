# Use Node.js 18 Alpine backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Generate Prisma 
RUN npx prisma generate


# Expose backend port
EXPOSE 4000

# Default command (dev mode with ts-node-dev)
CMD ["npm", "run", "dev"]
