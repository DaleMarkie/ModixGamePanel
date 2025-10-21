"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import CreateMod from "./CreateMod"; // this is your actual feature component

export default function CreateModPage() {
  return (
    <DashboardLayout>
      <CreateMod />
    </DashboardLayout>
  );
}
