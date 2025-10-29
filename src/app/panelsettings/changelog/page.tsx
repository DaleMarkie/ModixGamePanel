"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Changelogs from "./Changelogs"; // your actual feature component

export default function ChangelogsPage() {
  return (
    <DashboardLayout>
      <Changelogs />
    </DashboardLayout>
  );
}
