# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "src/app.js"]