"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import EmbededMessages from "./EmbededMessages"; // this is your actual feature component

export default function EmbededMessagesPage() {
  return (
    <DashboardLayout>
      <EmbededMessages />
    </DashboardLayout>
  );
}
