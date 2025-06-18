# Dockerfile for any Steam Dedicated Server using SteamCMD
FROM steamcmd/steamcmd:latest

# Set environment variables for flexibility
ENV STEAMAPPID=90 \
    STEAMAPPDIR=/home/steam/game_server \
    USER=steam

# Create server directory
RUN mkdir -p $STEAMAPPDIR

# Install the specified Steam Dedicated Server using SteamCMD
RUN steamcmd +login anonymous +force_install_dir $STEAMAPPDIR +app_update $STEAMAPPID validate +quit

# Set working directory
WORKDIR $STEAMAPPDIR

# Expose a range of common ports (can be overridden at runtime)
EXPOSE 27015-27050/udp 27015-27050/tcp

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy the Python server configuration script into the image
COPY steam_server_configure.py /home/steam/game_server/steam_server_configure.py

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
