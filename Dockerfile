# Build stage — installs deps and compiles the Vite/SCSS bundle
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage — tiny nginx image, just serves the static dist/
FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
# Clean default config and replace with a minimal one
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
