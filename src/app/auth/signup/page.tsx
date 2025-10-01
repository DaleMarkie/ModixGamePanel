"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Signup from "./signup"; // <-- Correct import

export default function SignupPage() {
  return (
    <DashboardLayout>
      <Signup />
    </DashboardLayout>
  );
}
