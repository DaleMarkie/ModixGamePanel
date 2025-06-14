# =========================
# Imports and Path Setup
# =========================
import json
import os
import sys
import docker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODIX_CONFIG_PATH = os.path.join(BASE_DIR, 'modix_config', 'modix_config.json')

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
            # Only consider running containers if reuse_ports is False
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

    def is_port_available(self, port, container_id=None):
        # If all ports allowed, always available
        if self.port_range is None:
            return True
        if port not in self.port_range:
            return False
        # Check if port is in use by another container
        client = docker.from_env()
        for container in client.containers.list(all=True):
            ports = container.attrs['NetworkSettings']['Ports']
            if ports:
                for port_proto, bindings in ports.items():
                    if bindings:
                        for binding in bindings:
                            try:
                                if int(binding['HostPort']) == port:
                                    # Allow if it's our own container
                                    if container_id and container.id == container_id:
                                        continue
                                    # If reuse_ports is True, allow if not running
                                    if self.reuse_ports and container.status != 'running':
                                        continue
                                    return False
                            except (KeyError, ValueError, TypeError):
                                continue
        return True

    def verify_and_assign_ports(self, config_path, container_id=None):
        with open(config_path, 'r') as f:
            config = json.load(f)
        base_settings = config.setdefault('BaseSettings', {})
        protocal_ports = base_settings.get('protocal_ports') or []
        updated = False
        for port_entry in protocal_ports:
            desired = port_entry.get('desired_container_port')
            protocol = port_entry.get('protocol', 'udp')
            assigned = port_entry.get('assigned_host_port')
            # Always check if assigned is set, in range, and available
            valid = (
                assigned is not None and
                (self.port_range is None or assigned in self.port_range) and
                self.is_port_available(assigned, container_id=container_id)
            )
            if not valid:
                # Try to use desired if available and in range
                if desired and (self.port_range is None or desired in self.port_range) and self.is_port_available(desired, container_id=container_id):
                    port_entry['assigned_host_port'] = desired
                    updated = True
                else:
                    # Find next available in range
                    port_entry['assigned_host_port'] = self._find_next_available(desired, container_id=container_id)
                    updated = True
        if updated:
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
        # Return mapping of container_port:host_port
        return {p['desired_container_port']: p['assigned_host_port'] for p in protocal_ports}

    def _find_next_available(self, start_port=None, container_id=None):
        # If all ports allowed, just pick next unused above start_port
        if self.port_range is None:
            port = start_port or 1024
            while not self.is_port_available(port, container_id=container_id):
                port += 1
            return port
        # Otherwise, pick next in range
        for port in self.port_range:
            if self.is_port_available(port, container_id=container_id):
                return port
        raise RuntimeError('No available ports in the specified range.')

if __name__ == "__main__":
    if len(sys.argv) == 2:
        pa = PortAllocator()
        mapping = pa.verify_and_assign_ports(sys.argv[1])
        print(json.dumps(mapping, indent=2))
    else:
        print("Usage: python port_allocator.py <server_config.json>")
