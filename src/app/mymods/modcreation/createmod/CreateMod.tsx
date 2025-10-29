"use client";

import React, { useState, useRef } from "react";
import {
  FaFolderPlus,
  FaImage,
  FaUpload,
  FaSave,
  FaSteam,
} from "react-icons/fa";
import { motion } from "framer-motion";
import "./CreateMod.css";
import { getServerUrl } from "@/app/config";

interface ModForm {
  name: string;
  id: string;
  description: string;
  tags: string;
  version: string;
  visibility: "public" | "private" | "friends";
  poster: File | null;
}

export default function CreateModPage() {
  const [form, setForm] = useState<ModForm>({
    name: "",
    id: "",
    description: "",
    tags: "",
    version: "1.0",
    visibility: "public",
    poster: null,
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate clean mod ID
  const generateId = (name: string) =>
    name
      .replace(/[^a-zA-Z0-9]+/g, "")
      .replace(/\s+/g, "")
      .trim();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      id: name === "name" ? generateId(value) : prev.id,
    }));
  };

  const handlePoster = (file: File) => {
    setForm((prev) => ({ ...prev, poster: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePoster(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handlePoster(file);
  };

  const handleCreateMod = async () => {
    if (!form.name || !form.id) {
      setStatus("⚠️ Please fill in required fields (Name & ID)");
      return;
    }

    setLoading(true);
    setStatus("Creating mod...");
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null) data.append(key, val as any);
    });

    try {
      const res = await fetch(`${getServerUrl()}/api/mods/create`, {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.message);
      setStatus(`✅ Mod "${form.name}" created successfully.`);
      setStep(2);
    } catch (err: any) {
      setStatus(`❌ ${err.message || "Failed to create mod."}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishWorkshop = async () => {
    setLoading(true);
    setStatus("Publishing to Steam Workshop...");
    try {
      const res = await fetch(`${getServerUrl()}/api/mods/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId: form.id }),
      });
      const json = await res.json();

      if (json.success) {
        setStatus("✅ Successfully published to Steam Workshop!");
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      setStatus(`❌ ${err.message || "Failed to publish."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-mod-page">
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FaFolderPlus /> Create Project Zomboid Mod
      </motion.h1>

      {step === 1 && (
        <motion.div
          className="mod-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <label>
            Mod Name <span>*</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Apocalypse Overhaul"
            />
          </label>

          <label>
            Mod ID
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="Auto-generated from name"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your mod’s features..."
            />
          </label>

          <label>
            Tags
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="e.g. realism, weapons, hardcore"
            />
          </label>

          <div className="form-row">
            <label>
              Version
              <input
                name="version"
                value={form.version}
                onChange={handleChange}
                placeholder="1.0"
              />
            </label>
            <label>
              Visibility
              <select
                name="visibility"
                value={form.visibility}
                onChange={handleChange}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </label>
          </div>

          <div
            className="poster-dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <FaImage className="icon" />
            <p>
              Drag & Drop Poster Here <br /> or <span>Click to Upload</span>
            </p>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleFileSelect}
            />
            {preview && <img src={preview} alt="Poster preview" />}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="create-btn"
            onClick={handleCreateMod}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaUpload className="animate-spin" /> Creating...
              </>
            ) : (
              <>
                <FaSave /> Create Mod
              </>
            )}
          </motion.button>

          {status && <p className="status">{status}</p>}
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          className="publish-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>🎉 Mod Created!</h2>
          <p>
            Your mod has been set up successfully. Would you like to publish it
            to Steam Workshop?
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="publish-btn"
            onClick={handlePublishWorkshop}
            disabled={loading}
          >
            <FaSteam /> {loading ? "Publishing..." : "Publish to Workshop"}
          </motion.button>

          {status && <p className="status">{status}</p>}
        </motion.div>
      )}
    </div>
  );
}
