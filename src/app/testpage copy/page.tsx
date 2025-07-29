"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Testpage from "./Terms"; // <-- Correct import

export default function TermsPage() {
  return (
    <DashboardLayout>
      <Testpage />
    </DashboardLayout>
  );
}
