"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import MyTickets from "./MyTickets"; // <-- Correct import

export default function MyTicketsPage() {
  return (
    <DashboardLayout>
      <MyTickets />
    </DashboardLayout>
  );
}
