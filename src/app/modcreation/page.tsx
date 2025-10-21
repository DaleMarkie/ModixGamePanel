"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModCreation from "./ModCreation"; // this is your actual feature component

export default function ModCreationPage() {
  return (
    <DashboardLayout>
      <ModCreation />
    </DashboardLayout>
  );
}
