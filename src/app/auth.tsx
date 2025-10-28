"use client";

import React, { ReactNode, useEffect, useState } from "react";

const USER_KEY = "modix_user";

interface User {
  username: string;
  role: "Owner" | "Admin" | "SubUser";
  pages: string[]; // ⚡ permissions
}

interface AuthWrapperProps {
  children: ReactNode;
  pageName: string; // current page to check
  roles?: Array<"Owner" | "Admin" | "SubUser">; // optional role check
}

export default function AuthWrapper({ children, pageName, roles }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) setUser(JSON.parse(storedUser));
    setChecked(true);
  }, []);

  if (!checked) return null;

  const Card = ({ children }: { children: ReactNode }) => (
    <div
      style={{
        textAlign: "center",
        background: "#1b1d23",
        padding: "2.5rem",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        color: "#fff",
        maxWidth: "450px",
        margin: "0 1rem",
      }}
    >
      {children}
    </div>
  );

  const Button = ({ children, onClick, href }: { children: ReactNode; onClick?: () => void; href?: string }) => (
    <a
      href={href}
      onClick={onClick}
      style={{
        display: "inline-block",
        padding: "0.75rem 1.75rem",
        backgroundColor: "#006400",
        color: "#fff",
        borderRadius: "8px",
        fontWeight: "bold",
        textDecoration: "none",
        margin: "0.5rem",
        transition: "all 0.2s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#008000")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#006400")}
    >
      {children}
    </a>
  );

  // 🚨 No user logged in
  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Card>
          <h1 style={{ color: "#ff5555", fontSize: "2rem", marginBottom: "1rem" }}>⚠️ Access Denied</h1>
          <p style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>You must be logged in to access this page.</p>
          <Button href="/auth/login">Go to Login</Button>
        </Card>
      </div>
    );
  }

  // 🚨 Role restriction
  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Card>
          <h1 style={{ color: "#ff5555", fontSize: "2rem", marginBottom: "1rem" }}>⚠️ Access Denied</h1>
          <p style={{ fontSize: "1rem" }}>You don’t have the required role to view this page. Contact your admin.</p>
        </Card>
      </div>
    );
  }

  // 🚨 Page permission check (Owners bypass)
  if (user.role !== "Owner" && (!user.pages || !user.pages.includes(pageName))) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Card>
          <h1 style={{ color: "#ff5555", fontSize: "2rem", marginBottom: "1rem" }}>⚠️ Access Denied</h1>
          <p style={{ fontSize: "1rem" }}>
            You do not have permission to view this page. <br />
            Ask your server owner to grant access.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Button href="javascript:history.back()">⬅️ Back</Button>
            <Button href="/auth/login">Go to Login</Button>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ User has access
  return <>{children}</>;
}
