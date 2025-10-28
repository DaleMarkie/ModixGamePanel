"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Workshop from "./frontend/Workshop";
import AuthWrapper from "@/app/auth"; // central wrapper

export default function WorkshopPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Workshop />
      </DashboardLayout>
    </AuthWrapper>
  );
}
