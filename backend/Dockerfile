FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
# Copy full project
COPY . .
# Expose port
EXPOSE 4000
# Start backend using Nx
CMD ["npx", "nx", "serve", "backend"]