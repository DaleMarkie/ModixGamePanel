"use client";

import React from "react";
import "./ThemeManager.css"; // Optional, for custom styles

export default function ThemeManager() {
  return (
    <main className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <div className="text-5xl mb-4">🎨</div>
      <h1 className="text-3xl font-bold mb-2">Theme Manager</h1>
      <p className="text-lg text-muted-foreground mb-4">
        This feature is not available in <strong>Modix v1.1.2</strong>.<br />
        It is still under active development and will arrive in a future update.
      </p>
      <div className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-md text-sm">
        Thank you for your patience!
      </div>
    </main>
  );
}
