"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Contact from "./Contact"; // <-- Correct import

export default function ContactPage() {
  return (
    <DashboardLayout>
      <Contact />
    </DashboardLayout>
  );
}
