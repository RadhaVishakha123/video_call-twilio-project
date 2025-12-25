FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

RUN npm install

# ❌ DO NOT COPY SOURCE CODE
# COPY . .

EXPOSE 4000

CMD ["npx", "nx", "serve", "backend"]
