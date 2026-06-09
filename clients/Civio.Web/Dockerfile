# Web is built on the host (npm run build) — container only serves static dist.
# Avoids slow/OOM-prone npm install inside Docker.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
EXPOSE 80
