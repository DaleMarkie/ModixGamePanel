"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import MyAccount from "./MyAccount"; // this is your actual feature component

export default function MyAccount() {
  return (
    <DashboardLayout>
      <MyAccount />
    </DashboardLayout>
  );
}
