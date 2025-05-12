# ── Dockerfile ────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm ci

# 2) Копируем весь код и собираем
COPY . .
RUN npm run build

# 3) Финальный образ
FROM node:18-alpine
WORKDIR /app

# Копируем только билд и устанавливаем serve
COPY --from=builder /app/dist ./dist
RUN npm install -g serve

# Открываем порт, на котором будет слушать serve
EXPOSE 8080

# Отдаем папку dist как статический сайт
CMD ["serve", "-s", "dist", "-l", "8080"]
