# --- Build Stage ---
FROM node:20.18.2 AS build

WORKDIR /app

# Copy package.json and yarn.lock first (better caching)
COPY ./package.json ./
COPY ./yarn.lock ./

# Install dependencies inside the container
RUN yarn install --frozen-lockfile

# Copy the rest of the application files (excluding node_modules)
COPY . .

# Build the app
RUN yarn run build

# Rebuild bcrypt for the correct OS (Linux)
RUN yarn remove bcrypt && yarn add bcrypt

# --------- Production Stage -----------

FROM node:20.18.2-bullseye AS production

WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=build /app/package.json /app/yarn.lock ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "run", "start:prod"]
