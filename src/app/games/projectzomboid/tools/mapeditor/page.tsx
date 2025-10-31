"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import MapEditor from "./MapEditor"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function MapEditorPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <MapEditor />
      </DashboardLayout>
    </AuthWrapper>
  );
}
