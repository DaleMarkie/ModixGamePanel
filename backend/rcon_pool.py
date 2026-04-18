import asyncio
from mcrcon import MCRcon

class RCONPool:
    def __init__(self, host, password, port=27015):
        self.host = host
        self.password = password
        self.port = port
        self.conn = None
        self.lock = asyncio.Lock()

    def connect(self):
        if self.conn:
            return
        self.conn = MCRcon(self.host, self.password, self.port)
        self.conn.connect()

    def command(self, cmd: str):
        self.connect()
        return self.conn.command(cmd)

    def close(self):
        if self.conn:
            self.conn.disconnect()
            self.conn = None


# ✅ GLOBAL INSTANCE (THIS FIXES YOUR ERROR)
rcon_pool = RCONPool(
    host="127.0.0.1",
    password="your_rcon_password",
    port=27015
)