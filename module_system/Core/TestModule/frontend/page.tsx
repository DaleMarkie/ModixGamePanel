"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TestModulePage() {
  const params = useParams();
  const containerId = typeof params.container_id === "string"
    ? params.container_id
    : Array.isArray(params.container_id)
    ? params.container_id[0]
    : "";
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerId) return;
    setLoading(true);
    fetch(`/api/docker/${containerId}/inspect`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch container info");
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [containerId]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Test Module: Docker Container Inspector</h2>
      <div>
        <strong>Container ID:</strong> {containerId || <em>none</em>}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>Error: {error.message}</div>}
      {data && (
        <pre style={{ background: "#222", color: "#eee", padding: 12, borderRadius: 8, marginTop: 16 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
