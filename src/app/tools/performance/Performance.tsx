import React from "react";

const Tooltip = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => (
  <div className="relative group cursor-default">
    {children}
    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-300 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-10 select-none max-w-xs text-left">
      {text}
    </div>
  </div>
);

const InfoItem = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip: string;
}) => (
  <div className="flex justify-between items-start py-1 text-sm border-b border-zinc-800 group">
    <Tooltip text={tooltip}>
      <span className="text-zinc-400 font-medium">{label}</span>
    </Tooltip>

    <Tooltip text={tooltip}>
      <span className="text-zinc-100 text-right max-w-[60%] truncate">
        {value}
      </span>
    </Tooltip>
  </div>
);

const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="bg-zinc-900 rounded-2xl shadow-lg p-5 space-y-2 border border-zinc-800 hover:border-zinc-700 transition-colors">
    <h2 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
      {title}
    </h2>
    {children}
  </section>
);

const Performance = () => {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100 font-sans">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          🖥️ Modix Host Inspector
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Comprehensive system overview for your Modix server.
        </p>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="🧠 CPU">
          <InfoItem
            label="Model"
            value="Intel Xeon E5-2670 v3 @ 2.30GHz"
            tooltip="Processor model indicating the CPU’s make and capabilities."
          />
          <InfoItem
            label="Cores"
            value="24 (12 physical, 24 threads)"
            tooltip="Number of physical and logical cores available for processing tasks."
          />
          <InfoItem
            label="Clock Speed"
            value="2.30 GHz (Turbo 3.1 GHz)"
            tooltip="Base and maximum speed at which the CPU operates."
          />
          <InfoItem
            label="Architecture"
            value="x86_64"
            tooltip="CPU architecture specifying compatibility with 64-bit software."
          />
          <InfoItem
            label="Flags"
            value="sse4_2 avx2 hypervisor"
            tooltip="Supported CPU instruction sets and virtualization features."
          />
        </Card>

        <Card title="💾 Memory">
          <InfoItem
            label="Total RAM"
            value="64 GB"
            tooltip="Total available system memory for running applications."
          />
          <InfoItem
            label="Used RAM"
            value="21.3 GB"
            tooltip="Amount of memory currently in use by the system and applications."
          />
          <InfoItem
            label="Swap Total"
            value="16 GB"
            tooltip="Disk space allocated to supplement RAM when needed."
          />
          <InfoItem
            label="Swap Used"
            value="2.1 GB"
            tooltip="Current usage of the swap space."
          />
        </Card>

        <Card title="🗃️ Disk">
          <InfoItem
            label="Total Disk"
            value="1.5 TB (SSD)"
            tooltip="Overall storage capacity and type of the server’s primary drives."
          />
          <InfoItem
            label="/ (root)"
            value="80 GB used / 120 GB (66%)"
            tooltip="Storage usage on the root filesystem housing system files."
          />
          <InfoItem
            label="/data"
            value="460 GB used / 1.2 TB (38%)"
            tooltip="Disk usage for data storage such as game files and mods."
          />
        </Card>

        <Card title="🌐 Network">
          <InfoItem
            label="Primary IP"
            value="192.168.1.200"
            tooltip="Server’s internal IP address within the local network."
          />
          <InfoItem
            label="Public IP"
            value="93.184.216.34"
            tooltip="External IP address accessible from the internet."
          />
          <InfoItem
            label="Interface"
            value="eth0"
            tooltip="Network adapter handling communication for the server."
          />
          <InfoItem
            label="RX/TX"
            value="1.3 TB / 890 GB"
            tooltip="Data received (RX) and transmitted (TX) over the network."
          />
        </Card>

        <Card title="⚙️ Operating System">
          <InfoItem
            label="OS"
            value="Ubuntu 22.04.3 LTS"
            tooltip="Operating system running on the server."
          />
          <InfoItem
            label="Platform"
            value="Linux"
            tooltip="Underlying system platform or kernel family."
          />
          <InfoItem
            label="Kernel"
            value="5.15.0-91-generic"
            tooltip="Version of the core system kernel managing hardware interaction."
          />
          <InfoItem
            label="Uptime"
            value="14 days, 03:27:12"
            tooltip="Duration since the last server restart."
          />
          <InfoItem
            label="Hostname"
            value="modix-prod-node01"
            tooltip="Network name assigned to the server."
          />
        </Card>

        <Card title="🐳 Docker">
          <InfoItem
            label="Running In Docker"
            value="Yes"
            tooltip="Indicates if Modix is running inside a Docker container."
          />
          <InfoItem
            label="Container ID"
            value="2c01d3f798a7"
            tooltip="Unique identifier of the Docker container."
          />
          <InfoItem
            label="Image"
            value="ghcr.io/modix/server:latest"
            tooltip="Docker image used to create the container, including version."
          />
          <InfoItem
            label="Volumes"
            value="/var/lib/modix /data/mods"
            tooltip="Directories shared between host and container for persistent storage."
          />
        </Card>

        <Card title="🚀 Modix">
          <InfoItem
            label="Version"
            value="v2.8.1"
            tooltip="Current Modix software version deployed on this server."
          />
          <InfoItem
            label="Git Commit"
            value="4dfaa92 (main)"
            tooltip="Specific source code commit corresponding to this build."
          />
          <InfoItem
            label="Build Time"
            value="2025-07-28 15:24 UTC"
            tooltip="Timestamp when this version was compiled and packaged."
          />
          <InfoItem
            label="Environment"
            value="production"
            tooltip="Deployment environment (production, staging, etc.)."
          />
          <InfoItem
            label="API Port"
            value="3001"
            tooltip="Network port used by the backend API."
          />
          <InfoItem
            label="Frontend Port"
            value="3000"
            tooltip="Network port serving the frontend interface."
          />
        </Card>

        <Card title="🎮 GPU">
          <InfoItem
            label="Model"
            value="NVIDIA A4000"
            tooltip="Graphics processing unit model installed on the server."
          />
          <InfoItem
            label="Driver"
            value="525.147.05"
            tooltip="Installed GPU driver version."
          />
          <InfoItem
            label="VRAM"
            value="16 GB"
            tooltip="Dedicated video memory available on the GPU."
          />
          <InfoItem
            label="CUDA"
            value="12.1"
            tooltip="CUDA version supported by the GPU for parallel computing."
          />
        </Card>

        <Card title="📦 Extra Info">
          <InfoItem
            label="Timezone"
            value="UTC (Auto)"
            tooltip="System timezone configuration."
          />
          <InfoItem
            label="Locale"
            value="en_US.UTF-8"
            tooltip="Regional and language settings."
          />
          <InfoItem
            label="Shell"
            value="/bin/bash"
            tooltip="Default command line interpreter."
          />
          <InfoItem
            label="Python"
            value="3.11.3 (uvicorn+fastapi)"
            tooltip="Python runtime and framework used by backend services."
          />
          <InfoItem
            label="Node.js"
            value="v18.17.1"
            tooltip="Node.js runtime version used for frontend or tooling."
          />
        </Card>
      </div>

      <footer className="mt-20 text-sm text-center text-zinc-600 border-t border-zinc-800 pt-6">
        Modix System Inspector UI — Static Display © 2025
      </footer>
    </main>
  );
};

export default Performance;
