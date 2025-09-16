const API_BASE = "http://localhost:2010/api";

export interface ModInfo {
  id: string;
  name: string;
  path: string;
  poster: string | null;
  enabled: boolean;
}

// === Fetch all mods ===
export async function fetchMods(): Promise<ModInfo[]> {
  const res = await fetch(`${API_BASE}/mods`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch mods (${res.status}): ${txt}`);
  }
  const data = await res.json();
  return data.mods || [];
}

// === Load Project Zomboid order ===
export async function loadPZOrder(): Promise<ModInfo[]> {
  const res = await fetch(`${API_BASE}/mods/order`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to load mod order (${res.status}): ${txt}`);
  }
  const data = await res.json();
  return data.mods || [];
}

// === Toggle mod enabled/disabled ===
export async function toggleMod(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/mods/${id}/toggle`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to toggle mod ${id}`);
}

// === Delete mod ===
export async function deleteMod(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/mods/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete mod ${id}`);
}

// === Open mod folder ===
export async function openModFolder(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}/mods/open`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error(`Failed to open mod folder: ${path}`);
}

// === New functions your components were expecting ===

// Example: set the directory where mods are stored
export function setModDirectory(path: string) {
  // Implementation depends on your backend API or local config
  console.log(`Setting mod directory to: ${path}`);
}

// Example: fetch RimWorld mods (simulate with fetchMods or custom API)
export async function fetchRimWorldMods(): Promise<ModInfo[]> {
  // If you have a RimWorld endpoint, replace URL
  const res = await fetch(`${API_BASE}/rimworld/mods`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch RimWorld mods (${res.status}): ${txt}`);
  }
  const data = await res.json();
  return data.mods || [];
}

// Example: load RimWorld order (simulate with loadPZOrder or custom API)
export async function loadRWOrder(): Promise<ModInfo[]> {
  const res = await fetch(`${API_BASE}/rimworld/mods/order`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `Failed to load RimWorld mod order (${res.status}): ${txt}`
    );
  }
  const data = await res.json();
  return data.mods || [];
}
