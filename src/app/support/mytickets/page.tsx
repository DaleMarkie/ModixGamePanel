"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import MyTickets from "./MyTickets";

export default function MyTicketsPage() {
  return (
    <DashboardLayout panelName="MODIX">
      <MyTickets />
    </DashboardLayout>
  );
}
