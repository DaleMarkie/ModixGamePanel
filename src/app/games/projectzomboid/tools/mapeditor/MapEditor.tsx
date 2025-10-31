"use client";

import React, { useEffect, useRef, useState } from "react";
import "./MapEditor.css";

interface Entity {
  id?: string;
  name?: string;
  type?: string;
  health?: number;
  x: number;
  y: number;
}

interface MapState {
  players: Entity[];
  zombies: Entity[];
  loot: Entity[];
}

const MapEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [state, setState] = useState<MapState>({
    players: [],
    zombies: [],
    loot: [],
  });
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [selectedLootId, setSelectedLootId] = useState<string | null>(null);

  // Load map image
  useEffect(() => {
    const img = new Image();
    img.src = "/api/projectzomboid/map/map-image";
    img.onload = () => setMapImage(img);
  }, []);

  // Fetch world state every 2s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/projectzomboid/map/state");
        const data: MapState = await res.json();
        setState(data);
      } catch (err) {
        console.error("Failed to fetch map state:", err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapImage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

    const scale = canvas.width / 5000; // adjust to match world size

    // Loot
    state.loot.forEach((l) => {
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(l.x * scale, l.y * scale, 6, 0, Math.PI * 2);
      ctx.fill();

      if (selectedLootId === l.id) {
        ctx.strokeStyle = "#00ff7f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(l.x * scale, l.y * scale, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Zombies
    state.zombies.forEach((z) => {
      ctx.fillStyle = "#ff4c4c";
      ctx.beginPath();
      ctx.arc(z.x * scale, z.y * scale, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Players
    state.players.forEach((p) => {
      ctx.fillStyle = "#006400";
      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, 7, 0, Math.PI * 2);
      ctx.fill();

      if (p.name) {
        ctx.fillStyle = "#00ff7f";
        ctx.font = "11px Arial";
        ctx.fillText(p.name, p.x * scale + 8, p.y * scale + 4);
      }
    });
  }, [mapImage, state, selectedLootId]);

  // Tooltip & click
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scale = canvas.width / 5000;

    // Hover player
    const hoveredPlayer = state.players.find(
      (p) => Math.hypot(mx - p.x * scale, my - p.y * scale) < 10
    );
    if (hoveredPlayer) {
      setTooltip({
        text: `${hoveredPlayer.name} (${hoveredPlayer.health} HP)`,
        x: e.clientX,
        y: e.clientY,
      });
      return;
    }

    // Hover loot
    const hoveredLoot = state.loot.find(
      (l) => Math.hypot(mx - l.x * scale, my - l.y * scale) < 10
    );
    if (hoveredLoot) {
      setTooltip({
        text: `${hoveredLoot.name || "Loot"} (${
          hoveredLoot.type || "Unknown"
        })`,
        x: e.clientX,
        y: e.clientY,
      });
      return;
    }

    setTooltip(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scale = canvas.width / 5000;

    const clickedLoot = state.loot.find(
      (l) => Math.hypot(mx - l.x * scale, my - l.y * scale) < 10
    );
    if (clickedLoot) {
      setSelectedLootId(clickedLoot.id || null);
      window.open(
        `/games/projectzomboid/tools/lootspawneditor?loot=${clickedLoot.id}`,
        "_blank"
      );
    }
  };

  return (
    <div
      className="map-editor-page"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <h1>🌎 Project Zomboid Map Editor</h1>
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        className="map-canvas"
      />
      {tooltip && (
        <div
          className="tooltip"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default MapEditor;
