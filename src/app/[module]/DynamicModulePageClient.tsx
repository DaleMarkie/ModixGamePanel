"use client";

import { useEffect, useState } from "react";
import { hasPermission } from "@/utils/hasPermission";
import { authFetch } from "@/utils/authFetch";
import DynamicModuleClient from "./DynamicModuleClient";

interface UserPermission {
  permission: string;
  value?: string;
  scope?: string;
  container_id?: number;
}

interface MeResponse {
  direct_permissions?: UserPermission[];
  role_permissions?: UserPermission[];
}

function Forbidden({
  requiredPerms,
  userPerms,
  moduleDisplayName,
}: {
  requiredPerms: string[];
  userPerms: string[];
  moduleDisplayName?: string;
}) {
  const copyDebugInfo = () => {
    navigator.clipboard.writeText(
      `Required: ${JSON.stringify(requiredPerms)}\nUser: ${JSON.stringify(
        userPerms
      )}`
    );
    alert("Debug info copied!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-black px-4">
      <div className="relative w-full max-w-lg bg-gray-900/80 backdrop-blur-lg border border-green-800 rounded-3xl shadow-2xl p-10 text-center">
        <h1 className="text-6xl font-extrabold mb-6 text-green-400 drop-shadow-lg animate-pulse">
          403
        </h1>
        <h2 className="text-2xl font-bold mb-4 text-white">Access Denied</h2>
        <p className="text-green-200 mb-6">
          You do not have permission to access{" "}
          <span className="font-semibold text-green-400">
            {moduleDisplayName || "this module"}
          </span>
          .
        </p>

        <div className="bg-gray-800/70 border border-green-700 rounded-xl p-4 text-left font-mono text-sm text-green-200 mb-8 shadow-inner overflow-auto max-h-36">
          <strong className="text-green-400 block mb-1">Debug Info:</strong>
          Required: <code>{JSON.stringify(requiredPerms)}</code>
          <br />
          Your Permissions: <code>{JSON.stringify(userPerms)}</code>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl"
          >
            Login
          </button>
          <button
            onClick={copyDebugInfo}
            className="bg-gradient-to-r from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl"
          >
            Copy Debug Info
          </button>
        </div>

        <div className="absolute inset-0 rounded-3xl bg-green-500/10 blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}

interface DynamicModulePageClientProps {
  moduleParam: string;
  entry: string;
  requiredPerms: string[];
  moduleDisplayName?: string;
}

export default function DynamicModulePageClient({
  moduleParam,
  entry,
  requiredPerms,
  moduleDisplayName,
}: DynamicModulePageClientProps) {
  const [userPerms, setUserPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerms() {
      try {
        const res = await authFetch("/api/auth/me");
        const data: MeResponse = await res.json();

        const perms = Array.from(
          new Set([
            ...(data.direct_permissions?.map((p) => p.permission) || []),
            ...(data.role_permissions?.map((p) => p.permission) || []),
          ])
        );

        setUserPerms(perms);
      } catch {
        setUserPerms([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPerms();
  }, [moduleParam]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-950 via-gray-900 to-black text-green-400 text-lg animate-pulse">
        Loading Module...
      </div>
    );

  if (requiredPerms.length === 0) {
    return userPerms.length > 0 ? (
      <DynamicModuleClient entry={entry} />
    ) : (
      <Forbidden
        requiredPerms={requiredPerms}
        userPerms={[]}
        moduleDisplayName={moduleDisplayName}
      />
    );
  }

  if (!hasPermission({ permissions: userPerms }, requiredPerms)) {
    return (
      <Forbidden
        requiredPerms={requiredPerms}
        userPerms={userPerms}
        moduleDisplayName={moduleDisplayName}
      />
    );
  }

  return <DynamicModuleClient entry={entry} />;
}
