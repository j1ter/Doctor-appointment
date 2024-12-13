FROM node:18-alpine as backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend .

FROM node:18-alpine as admin
WORKDIR /app/admin
COPY Admin/package*.json ./
RUN npm install
COPY Admin .
RUN npm run build

FROM node:18-alpine as frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
# Copy backend files
COPY --from=backend /app/backend ./backend
# Copy built assets from admin
COPY --from=admin /app/admin/dist ./admin/dist
# Copy built assets from frontend
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Install production dependencies for backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production

# Expose the backend port
EXPOSE 8080

# Start the backend server
CMD ["npm", "start"]
