FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy static files
COPY public .

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
