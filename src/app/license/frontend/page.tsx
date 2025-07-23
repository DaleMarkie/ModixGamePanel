"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import SidebarUserInfo from "@components/sidebar/SidebarUserInfo";

function DockerInspector() {
  const searchParams = useSearchParams();
  const queryContainerId = searchParams.get("container_id") || "";
  const [containerId, setContainerId] = useState(queryContainerId);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchContainerInfo = (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`http://localhost:2010/api/docker/${id}/inspect`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch container info");
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (containerId) {
      fetchContainerInfo(containerId);
    }
  }, [containerId]);

  const handleQuery = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("queryId") as HTMLInputElement;
    setContainerId(input.value.trim());
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Test Module: Docker Container Inspector</h2>
      <form onSubmit={handleQuery} style={{ marginBottom: 16 }}>
        <label>
          <strong>Container ID:</strong>
          <input
            type="text"
            name="queryId"
            defaultValue={containerId}
            placeholder="Enter container ID..."
            style={{
              marginLeft: 8,
              padding: 4,
              borderRadius: 4,
              border: "1px solid #888",
              background: "#222",
              color: "#eee",
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            marginLeft: 12,
            padding: "4px 12px",
            borderRadius: 4,
            background: "#444",
            color: "#fff",
            border: "none",
          }}
        >
          Query
        </button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>Error: {String(error)}</div>}
      {data && (
        <pre
          style={{
            background: "#222",
            color: "#eee",
            padding: 12,
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function License() {
  return (
    <DashboardLayout panelName="MODIX">
      <SidebarUserInfo />
      <DockerInspector />
    </DashboardLayout>
  );
}
