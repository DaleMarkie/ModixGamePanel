DOCKER_CREATE_SCHEMA = {
    "image": "steamcmd/steamcmd",
    "name": "pz_server_container",
    "detach": True,
    "command": None,  # e.g. "+login anonymous +force_install_dir /home/steam/pzserver +app_update 108600 validate +quit"
    "ports": {
        "16261/udp": 16261,
        "8766/udp": 8766,
        "27015/tcp": 27015
    },
    "volumes": {
        "pz_test_server_data": {
            "bind": "/home/steam/pzserver",
            "mode": "rw"
        }
    },
    "environment": {
        # Example: "PZ_ADMIN_PASSWORD": "changeme"
    },
    "labels": {
        "modix_managed": "1"
    },
    "restart_policy": {
        "Name": "unless-stopped"
    }
}
