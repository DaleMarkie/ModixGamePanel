"use client";

import React from "react";
import "./License.css";

export default function License() {
  return (
    <main className="license-page">
      <header>
        <h1>🔒 Modix Personal Use License</h1>
        <p>This software is licensed for personal, non-commercial use only.</p>
      </header>

      <section className="license-content">
        <h2>License Terms</h2>
        <p>
          This copy of the Modix Game Panel is provided under a limited-use
          personal license. By using this software, you agree to the following:
        </p>

        <ul>
          <li>
            You may use this software for{" "}
            <strong>personal and non-commercial</strong>
            purposes.
          </li>
          <li>
            You may <strong>not redistribute, resell, or sublicense</strong> any
            part of the software.
          </li>
          <li>
            Modifying the code for private use is allowed, but must not be
            shared publicly.
          </li>
          <li>Do not remove credits to the original author or team.</li>
        </ul>

        <h2>Ownership</h2>
        <p>
          The Modix Game Panel and all related assets are the intellectual
          property of <strong>OV3RLORD (Dale Markie)</strong> and the Modix
          team.
        </p>

        <h2>Liability Disclaimer</h2>
        <p>
          This software is provided &quot;as is&quot;, without any warranties.
          The Modix team is not responsible for any damages or data loss
          resulting from use of this software.
        </p>

        <h2>Contact & Permissions</h2>
        <p>
          To obtain a commercial license or contribute to development, please
          contact us via Discord or the official website.
        </p>
      </section>
    </main>
  );
}
