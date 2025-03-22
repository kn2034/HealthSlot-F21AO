# Stage 1: Development dependencies and build
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Stage 2: Production image
FROM node:18-slim
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built application from builder stage
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js .
COPY --from=builder /app/app.js .

# Create non-root user for security
RUN groupadd -r healthslot && useradd -r -g healthslot healthslot
RUN chown -R healthslot:healthslot /app
USER healthslot

# Expose application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"] 