# # --------------------------
# # Stage 1: Build
# # --------------------------
# FROM node:20-alpine AS build

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies (only production)
# RUN npm install --production

# # Copy the rest of the source code
# COPY . .

# # --------------------------
# # Stage 2: Production image
# # --------------------------
# FROM node:20-alpine

# # Set working directory
# WORKDIR /app

# # Copy everything from the build stage
# COPY --from=build /app /app

# # Expose the port your app listens on
# EXPOSE 5000

# # Start the app
# CMD ["node", "server.js"]




# --------------------------
# Stage 1: Build
# --------------------------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including prisma CLI)
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# --------------------------
# Stage 2: Production
# --------------------------
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app /app

EXPOSE 5000

CMD ["node", "server.js"]