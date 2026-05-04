# --- Stage 1: Build ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Cài toàn bộ thư viện
RUN npm install
COPY . .

# --- Stage 2: Production ---
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
# CHỈ cài thư viện dùng cho production, bỏ qua devDependencies và xóa cache ẩn
RUN npm install --omit=dev && npm cache clean --force
# Copy mã nguồn từ bước 1
COPY --from=builder /app/src ./src
EXPOSE 3000
CMD ["npm", "run", "start"]
