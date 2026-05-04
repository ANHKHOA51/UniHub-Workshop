# --- Stage 1: Build ---
FROM node:22-alpine AS builder
WORKDIR /app
# Copy package files
COPY package*.json ./
# Cài đặt toàn bộ thư viện để build
RUN npm install
# Copy toàn bộ source code
COPY . .
# Build ra HTML/CSS/JS tĩnh
RUN npm run build

# --- Stage 2: Production ---
FROM nginx:alpine
# Lấy kết quả build từ stage 1 đưa vào thư mục chứa web của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Xóa file cấu hình mặc định và sử dụng nginx tĩnh
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
