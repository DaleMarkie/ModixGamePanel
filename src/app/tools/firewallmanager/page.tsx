"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import FireWallManager from "./FireWallManager"; // <-- Correct import

export default function FireWallManagerPage() {
  return (
    <DashboardLayout>
      <FireWallManager />
    </DashboardLayout>
  );
}
