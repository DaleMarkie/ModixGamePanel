"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import DayZModmanger from "./DayZModmanger";

export default function DayZModmangerPage() {
  return (
    <DashboardLayout>
      <DayZModmanger />
    </DashboardLayout>
  );
}
