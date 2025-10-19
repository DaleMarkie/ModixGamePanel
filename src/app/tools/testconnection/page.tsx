"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import TestConnection from "./TestConnection"; // this is your actual feature component

export default function TestConnectionPage() {
  return (
    <DashboardLayout>
      <TestConnection />
    </DashboardLayout>
  );
}
