import React, { useState } from "react";

const InfoItem = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip: string;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="flex justify-between items-start py-1 border-b border-zinc-800 cursor-help relative group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      tabIndex={0}
      aria-describedby={`tooltip-${label.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <span className="text-zinc-400 font-semibold">{label}</span>
      <span className="text-zinc-100 text-right max-w-[60%] truncate">
        {value}
      </span>

      {visible && (
        <div
          id={`tooltip-${label.replace(/\s+/g, "-").toLowerCase()}`}
          role="tooltip"
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 max-w-xs whitespace-normal rounded bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg z-50 select-none pointer-events-none"
          style={{ pointerEvents: "none" }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="bg-zinc-900 rounded-xl shadow-lg p-5 space-y-2 border border-zinc-800">
    <h2 className="text-lg font-bold text-zinc-100 border-b border-zinc-800 pb-2">
      {title}
    </h2>
    {children}
  </section>
);

const Performance = () => {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          🖥️ Server Specs Dashboard
        </h1>
        <p className="text-zinc-400 mt-2">
          Full overview of the system running Modix. Dark. Clean. Brutal.
        </p>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="🧠 CPU">
          <InfoItem
            label="Model"
            value="Intel Xeon E5-2670 v3 @ 2.30GHz"
            tooltip="The CPU model and base clock speed installed on this server."
          />
          <InfoItem
            label="Cores"
            value="24 (12 physical, 24 threads)"
            tooltip="Total CPU cores and threads available (physical + hyper-threaded)."
          />
          <InfoItem
            label="Clock Speed"
            value="2.30 GHz (Turbo 3.1 GHz)"
            tooltip="Base and turbo clock frequencies of the CPU."
          />
          <InfoItem
            label="Architecture"
            value="x86_64"
            tooltip="CPU instruction set architecture."
          />
          <InfoItem
            label="Flags"
            value="sse4_2 avx2 hypervisor"
            tooltip="CPU features and capabilities supported."
          />
        </Card>

        <Card title="💾 Memory">
          <InfoItem
            label="Total RAM"
            value="64 GB"
            tooltip="Total installed physical RAM."
          />
          <InfoItem
            label="Used RAM"
            value="21.3 GB"
            tooltip="Currently used RAM by the system and processes."
          />
          <InfoItem
            label="Swap Total"
            value="16 GB"
            tooltip="Total swap space available for memory overflow."
          />
          <InfoItem
            label="Swap Used"
            value="2.1 GB"
            tooltip="Currently used swap space."
          />
        </Card>

        <Card title="🗃️ Disk">
          <InfoItem
            label="Total Disk"
            value="1.5 TB (SSD)"
            tooltip="Total storage capacity of the disk drive(s)."
          />
          <InfoItem
            label="/ (root)"
            value="80 GB used / 120 GB (66%)"
            tooltip="Disk usage and available space on the root partition."
          />
          <InfoItem
            label="/data"
            value="460 GB used / 1.2 TB (38%)"
            tooltip="Disk usage on the /data partition where large files reside."
          />
        </Card>

        <Card title="🌐 Network">
          <InfoItem
            label="Primary IP"
            value="192.168.1.200"
            tooltip="Internal IP address assigned to this server."
          />
          <InfoItem
            label="Public IP"
            value="93.184.216.34"
            tooltip="External IP address visible on the internet."
          />
          <InfoItem
            label="Interface"
            value="eth0"
            tooltip="Network interface used for primary communication."
          />
          <InfoItem
            label="RX/TX"
            value="1.3 TB / 890 GB"
            tooltip="Total received (RX) and transmitted (TX) network data."
          />
        </Card>

        <Card title="⚙️ Operating System">
          <InfoItem
            label="OS"
            value="Ubuntu 22.04.3 LTS"
            tooltip="The operating system running on this server."
          />
          <InfoItem
            label="Platform"
            value="Linux"
            tooltip="Underlying platform kernel type."
          />
          <InfoItem
            label="Kernel"
            value="5.15.0-91-generic"
            tooltip="Specific Linux kernel version."
          />
          <InfoItem
            label="Uptime"
            value="14 days, 03:27:12"
            tooltip="How long the system has been running since last reboot."
          />
          <InfoItem
            label="Hostname"
            value="modix-prod-node01"
            tooltip="The server's network hostname."
          />
        </Card>

        <Card title="🐳 Docker">
          <InfoItem
            label="Running In Docker"
            value="Yes"
            tooltip="Indicates if the service is running inside a Docker container."
          />
          <InfoItem
            label="Container ID"
            value="2c01d3f798a7"
            tooltip="Unique identifier of the running Docker container."
          />
          <InfoItem
            label="Image"
            value="ghcr.io/modix/server:latest"
            tooltip="Docker image name and tag used."
          />
          <InfoItem
            label="Volumes"
            value="/var/lib/modix /data/mods"
            tooltip="Mounted volume paths inside the container."
          />
        </Card>

        <Card title="🚀 Modix">
          <InfoItem
            label="Version"
            value="v2.8.1"
            tooltip="Current version of the Modix server software."
          />
          <InfoItem
            label="Git Commit"
            value="4dfaa92 (main)"
            tooltip="Git commit hash of the current build."
          />
          <InfoItem
            label="Build Time"
            value="2025-07-28 15:24 UTC"
            tooltip="Timestamp when the current build was compiled."
          />
          <InfoItem
            label="Environment"
            value="production"
            tooltip="Runtime environment of the application."
          />
          <InfoItem
            label="API Port"
            value="3001"
            tooltip="Port used by Modix API."
          />
          <InfoItem
            label="Frontend Port"
            value="3000"
            tooltip="Port where Modix frontend UI is served."
          />
        </Card>

        <Card title="🎮 GPU">
          <InfoItem
            label="Model"
            value="NVIDIA A4000"
            tooltip="Graphics processing unit model installed."
          />
          <InfoItem
            label="Driver"
            value="525.147.05"
            tooltip="GPU driver version."
          />
          <InfoItem
            label="VRAM"
            value="16 GB"
            tooltip="Dedicated video memory size."
          />
          <InfoItem
            label="CUDA"
            value="12.1"
            tooltip="CUDA toolkit version supported."
          />
        </Card>

        <Card title="📦 Extra Info">
          <InfoItem
            label="Timezone"
            value="UTC (Auto)"
            tooltip="Configured system timezone."
          />
          <InfoItem
            label="Locale"
            value="en_US.UTF-8"
            tooltip="System locale settings."
          />
          <InfoItem
            label="Shell"
            value="/bin/bash"
            tooltip="Default user shell."
          />
          <InfoItem
            label="Python"
            value="3.11.3 (uvicorn+fastapi)"
            tooltip="Python runtime and web framework version."
          />
          <InfoItem
            label="Node.js"
            value="v18.17.1"
            tooltip="Node.js runtime version."
          />
        </Card>
      </div>

      <footer className="mt-16 text-sm text-center text-zinc-600">
        Modix Host Inspector
      </footer>
    </main>
  );
};

export default Performance;
