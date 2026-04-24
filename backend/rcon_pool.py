import asyncio
from mcrcon import MCRcon

class RCONPool:
    def __init__(self, host, password, port=27015):
        self.host = host
        self.password = password
        self.port = port
        self.conn = None
        self.lock = asyncio.Lock()

    # ---------------- CONNECT ----------------
    def _connect(self):
        if self.conn:
            return
        self.conn = MCRcon(self.host, self.password, self.port)
        self.conn.connect()

    # ---------------- DISCONNECT ----------------
    def _disconnect(self):
        if self.conn:
            try:
                self.conn.disconnect()
            except:
                pass
            self.conn = None

    # ---------------- EXECUTE COMMAND (SYNC) ----------------
    def _command(self, cmd: str):
        self._connect()
        return self.conn.command(cmd)

    # ---------------- PUBLIC ASYNC WRAPPER ----------------
    async def command(self, cmd: str):
        async with self.lock:
            try:
                # run blocking RCON in thread (IMPORTANT FIX)
                return await asyncio.to_thread(self._command, cmd)

            except Exception as e:
                # force reconnect on failure
                self._disconnect()
                return f"RCON ERROR: {str(e)}"

    # ---------------- CLOSE ----------------
    def close(self):
        self._disconnect()


# ✅ GLOBAL INSTANCE
rcon_pool = RCONPool(
    host="127.0.0.1",
    password="modixgamepanel",
    port=27015
)