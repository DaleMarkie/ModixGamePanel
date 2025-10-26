"use client";

import React from "react";
import "./License.css";

export default function License() {
  return (
    <main className="license-page">
      <header className="license-header">
        <h1>⚖️ License & Terms of Use</h1>
        <p className="subtitle">
          🧑‍💻 Modix Game Panel Non-Commercial License (NC) – Version 1.4
        </p>
        <div className="license-warning">
          ⚠️{" "}
          <strong>
            Do NOT remove this license or its credits under any circumstances.
          </strong>
        </div>
      </header>

      <section className="license-content">
        <p>
          <strong>
            Copyright (c) 2025 Ov3rlord (Dale Markie) & the Modix Dev Team
          </strong>
        </p>

        <p>
          All components of Modix — including source code, API code, UI,
          backend, frontend, and assets — are the exclusive property of Ov3rlord
          (Dale Markie) and the Modix Dev Team. You are free to use, modify, and
          contribute to Modix for personal, educational, or community use, but
          not for commercial purposes.
        </p>

        <h2>✅ You May</h2>
        <ul>
          <li>Use Modix locally for personal or educational projects</li>
          <li>Modify and build upon Modix for non-commercial purposes</li>
          <li>Share improvements or extensions for community benefit</li>
        </ul>

        <h2>🚫 You May NOT</h2>
        <ul>
          <li>Copy or reupload Modix or its components elsewhere</li>
          <li>Sell, rent, or license the core Modix Software</li>
          <li>
            Use any Modix UI, assets, or frontend code in other software or
            websites
          </li>
          <li>Use Modix for cheating, exploiting, or any illegal activity</li>
          <li>Claim ownership or remove attribution</li>
        </ul>

        <h2>🔌 Add-ons and Extensions</h2>
        <p>
          Users may create and sell verified add-ons or extensions only after
          approval from the Modix Dev Team via our official Discord:{" "}
          <a
            href="https://discord.gg/EwWZUSR9tM"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://discord.gg/EwWZUSR9tM
          </a>
        </p>
        <p>Any unverified or unauthorized sale is strictly prohibited.</p>
        <p>The Modix Dev Team may revoke verification for any violations.</p>

        <h2>⚖️ Other Terms</h2>
        <ul>
          <li>
            License updates may occur; users must follow the latest version
          </li>
          <li>Violations immediately terminate your rights to use Modix</li>
          <li>Governed by the laws of the United Kingdom</li>
          <li>
            By using or modifying Modix Game Panel, you agree to all the above
            terms. The software remains open source for the community but
            ownership stays with Ov3rlord (Dale Markie) and the Modix Dev Team.
          </li>
        </ul>
      </section>

      <footer className="license-footer">
        &copy; {new Date().getFullYear()} Ov3rlord & Modix Dev Team. All rights
        reserved.
      </footer>
    </main>
  );
}
