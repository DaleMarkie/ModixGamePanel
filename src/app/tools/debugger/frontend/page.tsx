// /src/app/tools/debugger/page.tsx
"use client";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Debugger from "./Debugger";

export default function DebuggerPage() {
  return (
    <DashboardLayout>
      <Debugger />
    </DashboardLayout>
  );
}
