# Dockerfile for Project Zomboid Dedicated Server
FROM steamcmd/steamcmd:latest

# Set environment variables
ENV STEAMAPPID=108600 \
    STEAMAPPDIR=/home/steam/pzserver \
    USER=steam

# Create server directory
RUN mkdir -p $STEAMAPPDIR

# Install Project Zomboid Dedicated Server using SteamCMD
RUN steamcmd +login anonymous +force_install_dir $STEAMAPPDIR +app_update $STEAMAPPID validate +quit

# Set working directory
WORKDIR $STEAMAPPDIR

# Expose default PZ ports (UDP: 16261, 16262, TCP: 27015, RCON: 27020)
EXPOSE 16261/udp 16262/udp 27015/tcp 27020/tcp

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
