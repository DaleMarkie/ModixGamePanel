"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Updater from "./Updater"; // your actual feature component

export default function UpdaterPage() {
  return (
    <DashboardLayout>
      <Updater />
    </DashboardLayout>
  );
}
