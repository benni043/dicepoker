FROM node:20-alpine3.16

# Set working directory
WORKDIR /app

# Copy frontend and backend code
COPY backend ./backend
COPY frontend ./frontend

# Install and build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Install backend dependencies and build backend
WORKDIR /app/backend
RUN npm install
RUN npm run build

# Expose the production port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
