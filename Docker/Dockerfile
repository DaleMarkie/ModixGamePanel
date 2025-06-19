# Generalized Dockerfile for any SteamCMD-based game server using steamcmd/steamcmd base image
FROM steamcmd/steamcmd:latest

# Install additional dependencies if needed
USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        && rm -rf /var/lib/apt/lists/*

# Create a generic server directory (no chown needed, runs as root)
RUN mkdir -p /home/steam/server

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy all custom scripts into the container
COPY server_scripts/ /home/steam/server_scripts/

WORKDIR /home/steam

# Generalized environment variables for any Steam game server
ENV STEAMAPPID=0
ENV STEAMAPPDIR=/home/steam/server
ENV STEAMAPP_BRANCH=public

# Set MODIX_DEBUG as an environment variable (default: false)
ENV MODIX_DEBUG=false

WORKDIR $STEAMAPPDIR

# Expose common ports (can be overridden)
EXPOSE 27015/udp 27015/tcp 27016/udp 27016/tcp

ENTRYPOINT ["/entrypoint.sh"]
