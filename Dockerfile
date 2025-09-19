# Use Node.js 18 Alpine frontend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend source files
COPY . .

# Build production version
RUN npm run build

# Install "serve" globally to serve the build folder
RUN npm install -g serve

# Expose frontend port
EXPOSE 5173

# Run the production build
CMD ["serve", "-s", "dist", "-l", "5173", "--single"]

