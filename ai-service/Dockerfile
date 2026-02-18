# Use official lightweight Node image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies (production only after build)
RUN npm ci

# Copy rest of the source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose the port your app runs on
EXPOSE 4003

# Start the application
CMD ["npm", "start"]
