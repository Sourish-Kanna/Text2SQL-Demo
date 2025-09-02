# Start with the official MySQL image
FROM mysql:8.0

# Copy all the .sql and .dump files from the local directory
# into the container's special initialization folder.
COPY . /docker-entrypoint-initdb.d/