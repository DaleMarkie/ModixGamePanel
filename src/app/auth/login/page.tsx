"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Login from "./login"; // <-- Correct import

export default function LoginPage() {
  return (
    <DashboardLayout>
      <Login />
    </DashboardLayout>
  );
}
