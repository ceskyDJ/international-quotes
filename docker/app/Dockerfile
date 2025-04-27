FROM node:22.15.0-alpine3.20

WORKDIR /home/node/app

# Copy licenses
COPY ./LICENSE ./LICENSE

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-fund --no-audit --ignore-scripts

# Copy source code
COPY ./src ./src

# Build application
RUN npm run build

# Remove unecessary files
RUN rm -rf ./src

# Setup running environment
ENV NODE_ENV=production

# Serve application
EXPOSE 3000
ENTRYPOINT ["npm", "run", "start"]
