# Build stage for Admin
FROM node:18-alpine as admin-build
WORKDIR /app/admin
COPY Admin/package*.json ./
RUN npm install
COPY Admin/ .
RUN npm run build

# Build stage for Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Backend and final stage
FROM node:18-alpine
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# Create directories for static files
RUN mkdir -p ./public/admin
RUN mkdir -p ./public/frontend

# Copy built admin files
COPY --from=admin-build /app/admin/dist ./public/admin

# Copy built frontend files
COPY --from=frontend-build /app/frontend/dist ./public/frontend

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
