"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import FireWallManager from "./FireWallManager";

export default function FireWall() {
  return (
    <DashboardLayout>
      <FireWallManager />
    </DashboardLayout>
  );
}
