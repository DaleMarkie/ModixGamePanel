"use client";
import { useEffect, useState } from "react";
import { hasPermission } from "@/utils/hasPermission";
import { authFetch } from "@/utils/authFetch";
import DynamicModuleClient from "./DynamicModuleClient";

function Forbidden({
  requiredPerms,
  userPerms,
  moduleDisplayName,
}: {
  requiredPerms: string[];
  userPerms: string[];
  moduleDisplayName?: string;
}) {
  return (
    <div
      style={{
        maxWidth: 520,
        margin: "48px auto",
        padding: 32,
        backgroundColor: "#0a0d08",
        borderRadius: 14,
        color: "#d7e8c3",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 8px 24px rgba(8, 40, 12, 0.9)",
        lineHeight: 1.65,
        textAlign: "center",
        userSelect: "none",
      }}
    >
      <h1
        style={{
          fontSize: 34,
          fontWeight: 900,
          marginBottom: 20,
          color: "#fff",
          textShadow: "none",
        }}
      >
        403 Forbidden
      </h1>

      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
        Sorry, you don’t have permission to access{" "}
        <span style={{ color: "#2f6b2f", fontWeight: "bold" }}>
          {moduleDisplayName || "this module"}
        </span>
        .
      </p>

      <p style={{ fontSize: 16, color: "#9cb87f", marginBottom: 28 }}>
        Please login or contact your administrator if you believe this is an
        error.
      </p>

      <div
        style={{
          backgroundColor: "#1e3315",
          padding: 18,
          borderRadius: 12,
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 13,
          color: "#b5cca0",
          textAlign: "left",
          maxHeight: 140,
          overflowY: "auto",
          boxShadow: "inset 0 0 8px #2e4a1e",
          marginBottom: 32,
          userSelect: "text",
        }}
      >
        <strong
          style={{
            color: "#aec788",
            fontSize: 14,
            marginBottom: 6,
            display: "block",
          }}
        >
          Debug Information:
        </strong>
        Required Permissions: <code>{JSON.stringify(requiredPerms)}</code>
        <br />
        Your Permissions: <code>{JSON.stringify(userPerms)}</code>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => (window.location.href = "/login")}
          style={{
            backgroundColor: "#2f6b2f",
            color: "#f0f7e6",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(47, 107, 47, 0.8)",
            transition: "background-color 0.3s ease, transform 0.15s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#3c8e3c";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2f6b2f";
            e.currentTarget.style.transform = "scale(1)";
          }}
          aria-label="Login"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default function DynamicModulePageClient({
  moduleParam,
  entry,
  requiredPerms,
  moduleDisplayName,
}: {
  moduleParam: string;
  entry: string;
  requiredPerms: string[];
  moduleDisplayName?: string;
}) {
  const [userPerms, setUserPerms] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerms() {
      try {
        const res = await authFetch("/api/auth/me");
        const data = await res.json();
        // Combine direct and role permissions
        const direct = (data.direct_permissions || []).map(
          (p: any) => p.permission
        );
        const role = (data.role_permissions || []).map(
          (p: any) => p.permission
        );
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
      return (
        <Forbidden
          requiredPerms={requiredPerms}
          userPerms={[]}
          moduleDisplayName={moduleDisplayName}
        />
      );
    }
  }
  // If permissions required, check them
  if (!hasPermission({ permissions: userPerms }, requiredPerms)) {
    return (
      <Forbidden
        requiredPerms={requiredPerms}
        userPerms={userPerms || []}
        moduleDisplayName={moduleDisplayName}
      />
    );
  }
  return <DynamicModuleClient entry={entry} />;
}
