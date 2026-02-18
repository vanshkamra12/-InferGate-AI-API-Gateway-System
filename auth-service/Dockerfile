# Use official lightweight Node image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port your app runs on
EXPOSE 4001

# Start the application
CMD ["npm", "start"]
