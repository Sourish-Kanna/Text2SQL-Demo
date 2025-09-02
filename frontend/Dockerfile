# Use an official Nginx image to serve static content
FROM nginx:1.25-alpine

# Copy the static website content (HTML, CSS, JS) into the Nginx server directory
COPY ./index.html /usr/share/nginx/html/
COPY ./style.css /usr/share/nginx/html/
COPY ./script.js /usr/share/nginx/html/

# Expose port 80 for the Nginx server
EXPOSE 80