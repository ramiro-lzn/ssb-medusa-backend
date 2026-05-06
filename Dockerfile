# STAGE 1: Base dependencies
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl
WORKDIR /server

# STAGE 2: Dependencies
# We do this separateley to leverage Docker caching
FROM base AS  dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

#Stage 3: Development
FROM base AS development
COPY . .
#Ensure scripts have permission to execute
RUN chmod +x ./develop-entrypoint.sh
EXPOSE 9000 5173
ENTRYPOINT [ "./develop-entrypoint.sh" ]

# STAGE 4: Builder
FROM dependencies AS builder
COPY . .
RUN npm run build

# STAGE 5: Production runtime
FROM node:20-alpine AS production
ENV NODE_ENV=production
RUN apk add --no-cache curl libc6-compat
# We move to /app to avoid confusion with the builder stage's /server
WORKDIR /app
# 1. Copy  ONLY the standalone build output
# This folder contains its own optimized optimized package.json created by Medusa
COPY --from=builder /server/.medusa/server ./
# 2. Copy the production entrypoint script
COPY --from=builder /server/prod-entrypoint.sh ./
# 3. Set permissions for the entrypoint script
RUN chmod +x ./prod-entrypoint.sh
# 4. Intall only production dependencies for the built code
# This happens inside the /app, using the built code's package.json
RUN npm install --legacy-peer-deps --omit=dev --no-audit --no-fund
# 5. set ownnership of everything to node AFTER install is done.
RUN chown -R node:node /app
USER node
EXPOSE 9000
ENTRYPOINT [ "./prod-entrypoint.sh" ]