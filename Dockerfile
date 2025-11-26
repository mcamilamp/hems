FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install OpenSSL for Prisma (needed for linux-musl-openssl-3.0.x target)
RUN apk add --no-cache openssl

RUN npm install

# Copy prisma folder separately to ensure it's available before generating
COPY prisma ./prisma
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
