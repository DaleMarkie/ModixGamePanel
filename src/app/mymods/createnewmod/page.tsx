"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import CreateNewMod from "./CreateNewMod"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function CreateNewModPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <CreateNewMod />
      </DashboardLayout>
    </AuthWrapper>
  );
}
