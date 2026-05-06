FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma (needed for linux-musl-openssl-3.0.x target)
RUN apk add --no-cache openssl

# Copy prisma schema first so the postinstall (prisma generate) hook can find it
COPY prisma ./prisma

# Copy package files and install dependencies (postinstall runs prisma generate)
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Make start script executable
RUN chmod +x scripts/start.sh

EXPOSE 8080

# Use the start script that handles migrations and seeding
CMD ["sh", "scripts/start.sh"]
