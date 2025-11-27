FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma (needed for linux-musl-openssl-3.0.x target)
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy application code
COPY . .

# Make start script executable
RUN chmod +x scripts/start.sh

EXPOSE 3000

# Use the start script that handles migrations and seeding
CMD ["sh", "scripts/start.sh"]
