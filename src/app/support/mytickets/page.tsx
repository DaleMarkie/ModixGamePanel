"use client";

import React, { FC } from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import MyTickets from "./MyTickets";

const MyTicketsPage: FC = () => {
  return (
    <DashboardLayout panelName="MODIX">
      <MyTickets />
    </DashboardLayout>
  );
};

export default MyTicketsPage;
