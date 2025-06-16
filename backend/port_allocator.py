# =========================
# Imports and Path Setup
# =========================
import json
import os
import docker
from debug_logger import DebugLogger

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODIX_CONFIG_PATH = os.path.join(BASE_DIR, 'modix_config', 'modix_config.json')

debug = DebugLogger()

class PortAllocator:
    def __init__(self):
        self.config = self._load_config()
        self.port_range = self._get_port_range()
        self.reuse_ports = self.config.get('MODIX_RESUSE_PORTS', False)
        self.used_ports = self._get_used_ports_from_docker()

    def _load_config(self):
        with open(MODIX_CONFIG_PATH, 'r') as f:
            return json.load(f)

    def _get_port_range(self):
        port_alloc = self.config.get('MODIX_PORT_ALLOCATION')
        if port_alloc is None:
            return None  # All ports allowed
        if 'start' not in port_alloc or 'end' not in port_alloc:
            raise ValueError('MODIX_PORT_ALLOCATION with start and end must be set in modix_config.json')
        return range(int(port_alloc['start']), int(port_alloc['end']) + 1)

    def _get_used_ports_from_docker(self):
        client = docker.from_env()
        used_ports = set()
        for container in client.containers.list(all=True):
            if not self.reuse_ports and container.status != 'running':
                continue
            ports = container.attrs['NetworkSettings']['Ports']
            if ports:
                for port_proto, bindings in ports.items():
                    if bindings:
                        for binding in bindings:
                            try:
                                used_ports.add(int(binding['HostPort']))
                            except (KeyError, ValueError, TypeError):
                                continue
        return used_ports

    def get_available_ports_from_list(self, requested_ports):
        """
        Takes a list of requested ports and returns a dict mapping container ports to assigned host ports.
        If a requested port is not in range or unavailable, assigns the next available port in range.
        Debug logs are printed for all decisions.
        """
        assigned_ports = {}
        used = set(self.used_ports)
        for port in requested_ports:
            in_range = not self.port_range or port in self.port_range
            if in_range and port not in used:
                debug.log(f"Port {port} is available and will be assigned as host port.")
                assigned_ports[port] = port
                used.add(port)
            else:
                # Find next available port in range
                found = False
                if self.port_range:
                    for candidate in self.port_range:
                        if candidate not in used:
                            debug.log(f"Port {port} is not available or not in range, assigning {candidate} as host port instead.")
                            assigned_ports[port] = candidate
                            used.add(candidate)
                            found = True
                            break
                else:
                    # No port range: search above requested port
                    candidate = port + 1
                    while candidate < 65536:
                        if candidate not in used:
                            debug.log(f"Port {port} is not available or not in range, assigning {candidate} as host port instead.")
                            assigned_ports[port] = candidate
                            used.add(candidate)
                            found = True
                            break
                        candidate += 1
                if not found:
                    debug.log(f"No available host port for container port {port}.")
                    assigned_ports[port] = None
        return assigned_ports

if __name__ == "__main__":
    import sys
    # Example usage: python port_allocator.py 20000 20001 20002
    requested_ports = [int(arg) for arg in sys.argv[1:]]
    allocator = PortAllocator()
    assigned = allocator.get_available_ports_from_list(requested_ports)
    debug.log(f"Original requested ports: {requested_ports}")
    debug.log(f"Container-to-host port assignments: {assigned}")
    print(assigned)
