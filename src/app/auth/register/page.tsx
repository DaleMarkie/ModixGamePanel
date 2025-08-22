"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Register from "./register"; // <-- Correct import

export default function RegisterPage() {
  return (
    <DashboardLayout>
      <Register />
    </DashboardLayout>
  );
}
