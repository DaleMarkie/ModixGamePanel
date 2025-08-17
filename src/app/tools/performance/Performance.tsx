import React, { useState, useEffect } from "react";

type ServerData = {
  cpu: {
    model: string;
    cores: string;
    clockSpeed: string;
    architecture: string;
    flags: string;
  };
  memory: {
    total: string;
    used: string;
    swapTotal: string;
    swapUsed: string;
  };
  disk: {
    total: string;
    root: string;
    data: string;
  };
  network: {
    primaryIP: string;
    publicIP: string;
    interface: string;
    rxTx: string;
  };
  os: {
    os: string;
    platform: string;
    kernel: string;
    uptime: string;
    hostname: string;
  };
  docker: {
    runningInDocker: string;
    containerID: string;
    image: string;
    volumes: string;
  };
  modix: {
    version: string;
    gitCommit: string;
    buildTime: string;
    environment: string;
    apiPort: string;
    frontendPort: string;
  };
  gpu: {
    model: string;
    driver: string;
    vram: string;
    cuda: string;
  };
  extra: {
    timezone: string;
    locale: string;
    shell: string;
    python: string;
    nodejs: string;
  };
};

const defaultData: ServerData = {
  cpu: {
    model: "Loading...",
    cores: "Loading...",
    clockSpeed: "Loading...",
    architecture: "Loading...",
    flags: "Loading...",
  },
  memory: {
    total: "Loading...",
    used: "Loading...",
    swapTotal: "Loading...",
    swapUsed: "Loading...",
  },
  disk: {
    total: "Loading...",
    root: "Loading...",
    data: "Loading...",
  },
  network: {
    primaryIP: "Loading...",
    publicIP: "Loading...",
    interface: "Loading...",
    rxTx: "Loading...",
  },
  os: {
    os: "Loading...",
    platform: "Loading...",
    kernel: "Loading...",
    uptime: "Loading...",
    hostname: "Loading...",
  },
  docker: {
    runningInDocker: "Loading...",
    containerID: "Loading...",
    image: "Loading...",
    volumes: "Loading...",
  },
  modix: {
    version: "Loading...",
    gitCommit: "Loading...",
    buildTime: "Loading...",
    environment: "Loading...",
    apiPort: "Loading...",
    frontendPort: "Loading...",
  },
  gpu: {
    model: "Loading...",
    driver: "Loading...",
    vram: "Loading...",
    cuda: "Loading...",
  },
  extra: {
    timezone: "Loading...",
    locale: "Loading...",
    shell: "Loading...",
    python: "Loading...",
    nodejs: "Loading...",
  },
};

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
  const [data, setData] = useState<ServerData>(defaultData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Replace with your real backend API URL
    fetch("http://localhost:2010/api/server-info")
      .then(async (res) => {
        if (!res.ok) throw new Error(`API error: ${res.statusText}`);
        const json = await res.json();
        setData(json);
        setError(null);
      })
      .catch((e) => {
        setError("Failed to load server info.");
        console.error(e);
      });
  }, []);

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

      {error && (
        <div className="mb-6 p-4 bg-red-900 rounded text-red-300 font-semibold">
          {error}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="🧠 CPU">
          <InfoItem
            label="Model"
            value={data.cpu.model}
            tooltip="The CPU model and base clock speed installed on this server."
          />
          <InfoItem
            label="Cores"
            value={data.cpu.cores}
            tooltip="Total CPU cores and threads available (physical + hyper-threaded)."
          />
          <InfoItem
            label="Clock Speed"
            value={data.cpu.clockSpeed}
            tooltip="Base and turbo clock frequencies of the CPU."
          />
          <InfoItem
            label="Architecture"
            value={data.cpu.architecture}
            tooltip="CPU instruction set architecture."
          />
          <InfoItem
            label="Flags"
            value={data.cpu.flags}
            tooltip="CPU features and capabilities supported."
          />
        </Card>

        <Card title="💾 Memory">
          <InfoItem
            label="Total RAM"
            value={data.memory.total}
            tooltip="Total installed physical RAM."
          />
          <InfoItem
            label="Used RAM"
            value={data.memory.used}
            tooltip="Currently used RAM by the system and processes."
          />
          <InfoItem
            label="Swap Total"
            value={data.memory.swapTotal}
            tooltip="Total swap space available for memory overflow."
          />
          <InfoItem
            label="Swap Used"
            value={data.memory.swapUsed}
            tooltip="Currently used swap space."
          />
        </Card>

        <Card title="🗃️ Disk">
          <InfoItem
            label="Total Disk"
            value={data.disk.total}
            tooltip="Total storage capacity of the disk drive(s)."
          />
          <InfoItem
            label="/ (root)"
            value={data.disk.root}
            tooltip="Disk usage and available space on the root partition."
          />
          <InfoItem
            label="/data"
            value={data.disk.data}
            tooltip="Disk usage on the /data partition where large files reside."
          />
        </Card>

        <Card title="🌐 Network">
          <InfoItem
            label="Primary IP"
            value={data.network.primaryIP}
            tooltip="Internal IP address assigned to this server."
          />
          <InfoItem
            label="Public IP"
            value={data.network.publicIP}
            tooltip="External IP address visible on the internet."
          />
          <InfoItem
            label="Interface"
            value={data.network.interface}
            tooltip="Network interface used for primary communication."
          />
          <InfoItem
            label="RX/TX"
            value={data.network.rxTx}
            tooltip="Total received (RX) and transmitted (TX) network data."
          />
        </Card>

        <Card title="⚙️ Operating System">
          <InfoItem
            label="OS"
            value={data.os.os}
            tooltip="The operating system running on this server."
          />
          <InfoItem
            label="Platform"
            value={data.os.platform}
            tooltip="Underlying platform kernel type."
          />
          <InfoItem
            label="Kernel"
            value={data.os.kernel}
            tooltip="Specific Linux kernel version."
          />
          <InfoItem
            label="Uptime"
            value={data.os.uptime}
            tooltip="How long the system has been running since last reboot."
          />
          <InfoItem
            label="Hostname"
            value={data.os.hostname}
            tooltip="The server's network hostname."
          />
        </Card>

        <Card title="🐳 Docker">
          <InfoItem
            label="Running In Docker"
            value={data.docker.runningInDocker}
            tooltip="Indicates if the service is running inside a Docker container."
          />
          <InfoItem
            label="Container ID"
            value={data.docker.containerID}
            tooltip="Unique identifier of the running Docker container."
          />
          <InfoItem
            label="Image"
            value={data.docker.image}
            tooltip="Docker image name and tag used."
          />
          <InfoItem
            label="Volumes"
            value={data.docker.volumes}
            tooltip="Mounted volume paths inside the container."
          />
        </Card>

        <Card title="🚀 Modix">
          <InfoItem
            label="Version"
            value={data.modix.version}
            tooltip="Current version of the Modix server software."
          />
          <InfoItem
            label="Git Commit"
            value={data.modix.gitCommit}
            tooltip="Git commit hash of the current build."
          />
          <InfoItem
            label="Build Time"
            value={data.modix.buildTime}
            tooltip="Timestamp when the current build was compiled."
          />
          <InfoItem
            label="Environment"
            value={data.modix.environment}
            tooltip="Runtime environment of the application."
          />
          <InfoItem
            label="API Port"
            value={data.modix.apiPort}
            tooltip="Port used by Modix API."
          />
          <InfoItem
            label="Frontend Port"
            value={data.modix.frontendPort}
            tooltip="Port where Modix frontend UI is served."
          />
        </Card>

        <Card title="🎮 GPU">
          <InfoItem
            label="Model"
            value={data.gpu.model}
            tooltip="Graphics processing unit model installed."
          />
          <InfoItem
            label="Driver"
            value={data.gpu.driver}
            tooltip="GPU driver version."
          />
          <InfoItem
            label="VRAM"
            value={data.gpu.vram}
            tooltip="Dedicated video memory size."
          />
          <InfoItem
            label="CUDA"
            value={data.gpu.cuda}
            tooltip="CUDA toolkit version supported."
          />
        </Card>

        <Card title="📦 Extra Info">
          <InfoItem
            label="Timezone"
            value={data.extra.timezone}
            tooltip="Configured system timezone."
          />
          <InfoItem
            label="Locale"
            value={data.extra.locale}
            tooltip="System locale settings."
          />
          <InfoItem
            label="Shell"
            value={data.extra.shell}
            tooltip="Default user shell."
          />
          <InfoItem
            label="Python"
            value={data.extra.python}
            tooltip="Python runtime and web framework version."
          />
          <InfoItem
            label="Node.js"
            value={data.extra.nodejs}
            tooltip="Node.js runtime version."
          />
        </Card>
      </div>
    </main>
  );
};

export default Performance;
