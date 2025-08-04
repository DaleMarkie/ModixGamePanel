"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import OrderEditor from "./OrderEditor"; // <-- Correct import

export default function OrderEditorPage() {
  return (
    <DashboardLayout>
      <OrderEditor />
    </DashboardLayout>
  );
}
