"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import FileBrowser from "./FileBrowser"; // <-- Correct import

export default function FileBrowserPage() {
  return (
    <DashboardLayout>
      <FileBrowser />
    </DashboardLayout>
  );
}
