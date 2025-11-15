"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ChatLogs from "./ChatLogs"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ChatLogsPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <ChatLogs />
      </DashboardLayout>
    </AuthWrapper>
  );
}
