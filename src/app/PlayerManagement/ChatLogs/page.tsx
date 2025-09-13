"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ChatLogs from "./ChatLogs"; // <-- Correct import

export default function ChatLogsPage() {
  return (
    <DashboardLayout>
      <ChatLogs />
    </DashboardLayout>
  );
}
