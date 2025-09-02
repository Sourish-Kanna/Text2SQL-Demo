# Start with a base Debian image which is common and stable
FROM python:3.11-slim-bookworm

# Install common development tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends git curl procps

# Set a working directory
WORKDIR /workspace

# This container will be kept running, but commands will be run manually
CMD ["sleep", "infinity"]
