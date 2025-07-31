"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ActionsGUI from "./ActionsGUI";

export default function ActionsGUIPage() {
  return (
    <DashboardLayout>
      <ActionsGUI />
    </DashboardLayout>
  );
}
