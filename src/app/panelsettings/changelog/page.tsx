"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import changelogs from "./Changelogs"; // your actual feature component

export default function changelogsPage() {
  return (
    <DashboardLayout>
      <changelogs />
    </DashboardLayout>
  );
}
