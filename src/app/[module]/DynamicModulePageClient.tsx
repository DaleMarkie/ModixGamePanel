"use client";
import { useEffect, useState } from "react";
import { hasPermission } from "@/utils/hasPermission";
import { authFetch } from "@/utils/authFetch";
import DynamicModuleClient from "./DynamicModuleClient";

function Forbidden({ requiredPerms, userPerms, moduleDisplayName }: { requiredPerms: string[]; userPerms: string[]; moduleDisplayName?: string }) {
  return (
    <div style={{ color: 'red', padding: 16, background: '#222', borderRadius: 8 }}>
      <b>403 Forbidden</b>
      <br />
      You do not have permission to view <b>{moduleDisplayName || "this module"}</b>.<br />
      <span style={{ fontSize: 12 }}>
        <b>Debug info:</b> Required: {JSON.stringify(requiredPerms)}<br />
        Yours: {JSON.stringify(userPerms)}
      </span>
      <br />
      Please login or contact administrator for permissions.
      <br />
    </div>
  );
}

export default function DynamicModulePageClient({ moduleParam, entry, requiredPerms, moduleDisplayName }: { moduleParam: string; entry: string; requiredPerms: string[]; moduleDisplayName?: string }) {
  const [userPerms, setUserPerms] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerms() {
      try {
        const res = await authFetch("/api/auth/me");
        const data = await res.json();
        // Combine direct and role permissions
        const direct = (data.direct_permissions || []).map((p: any) => p.permission);
        const role = (data.role_permissions || []).map((p: any) => p.permission);
        setUserPerms(Array.from(new Set([...direct, ...role])));
      } catch {
        setUserPerms([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPerms();
  }, [moduleParam]);

  if (loading) return <div>Loading...</div>;
  // If no permissions required, allow any logged-in user
  if (requiredPerms.length === 0) {
    if (userPerms !== null) {
      return <DynamicModuleClient entry={entry} />;
    } else {
      // Not logged in
      return <Forbidden requiredPerms={requiredPerms} userPerms={[]} moduleDisplayName={moduleDisplayName} />;
    }
  }
  // If permissions required, check them
  if (!hasPermission({ permissions: userPerms }, requiredPerms)) {
    return <Forbidden requiredPerms={requiredPerms} userPerms={userPerms || []} moduleDisplayName={moduleDisplayName} />;
  }
  return <DynamicModuleClient entry={entry} />;
}