# Using -slim (Debian) rather than -alpine: sqlite3/pg use native bindings
# that are simplest to build against glibc, avoiding alpine/musl build pain.
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

# Run pending migrations, then start the server. Safe to run on every
# deploy: sequelize-cli skips migrations that already ran.
CMD ["sh", "-c", "npm run db:migrate && npm start"]
