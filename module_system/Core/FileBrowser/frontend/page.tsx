"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import FileManager from "./FileManager"; // <-- Correct import

export default function FileManagerPage() {
  return (
    <DashboardLayout>
      <FileManager />
    </DashboardLayout>
  );
}
