"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import DiscordWebhooks from "./Webhook"; // <-- Correct import for DiscordWebhooks

export default function DiscordWebhooksPage() {
  return (
    <DashboardLayout>
      <DiscordWebhooks />
    </DashboardLayout>
  );
}
