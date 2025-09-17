"use client";

import React from "react";
import "./terms.css";

const Terms = () => {
  return (
    <div className="terms-container">
      <div className="terms-content">
        <h1>Modix Terms of Use</h1>
        <p className="last-updated">Last Updated: July 30, 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Modix Game Panel (&quot;Modix&quot;), you
            agree to be bound by these Terms of Use, our Privacy Policy, and any
            additional policies or guidelines applicable to specific features.
            If you do not agree to these terms, you must discontinue use of
            Modix immediately.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 16 years old, or the minimum age required by
            your country&rsquo;s digital consent laws, to use this platform.
            Accounts registered by bots or automated tools are strictly
            prohibited.
          </p>
        </section>

        <section>
          <h2>3. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and all activities conducted under your account.
            Modix is not liable for any loss or damage resulting from
            unauthorized access or use of your account.
          </p>
        </section>

        <section>
          <h2>4. Permitted Use</h2>
          <p>
            You agree to use Modix only for lawful purposes and in a manner
            consistent with these Terms. Prohibited actions include, but are not
            limited to:
          </p>
          <ul>
            <li>
              Attempting unauthorized access to any part of Modix or related
              systems
            </li>
            <li>
              Reverse engineering, decompiling, or modifying Modix or its
              components
            </li>
            <li>
              Hosting or distributing illegal, infringing, or harmful content
            </li>
            <li>
              Using Modix to violate any third-party rights, including
              intellectual property
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Mod Content and Licensing</h2>
          <p>
            Modix does not host, own, or distribute mods. All mods remain the
            property of their respective creators. You are responsible for
            ensuring your use of mods complies with Steam Workshop Terms and any
            relevant licenses.
          </p>
        </section>

        <section>
          <h2>6. Payment and Licensing</h2>
          <p>
            Modix currently offers a free Personal License. Paid Hosting
            Licenses may be introduced in the future. License keys are
            non-transferable, non-sublicensable, and may not be resold or
            shared.
          </p>
        </section>

        <section>
          <h2>7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account and access
            to Modix at our discretion for violations of these Terms, abusive
            behavior, or legal infractions. You may cancel your account at any
            time.
          </p>
        </section>

        <section>
          <h2>8. Availability and Uptime</h2>
          <p>
            While we strive for high availability, Modix is provided &quot;as
            is&quot; without guarantees of uninterrupted service. Maintenance
            windows, technical issues, or other unforeseen events may impact
            uptime.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            Modix is provided without warranties of any kind. We are not liable
            for data loss, mod corruption, downtime, or any direct or indirect
            damages arising from your use of the platform.
          </p>
        </section>

        <section>
          <h2>10. Modifications to Terms</h2>
          <p>
            We may update these Terms of Use at any time. Continued use of Modix
            after changes constitutes acceptance of the revised terms. We
            encourage you to review this page regularly.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            For questions or concerns about these Terms, contact us at{" "}
            <a href="mailto:support@modixpanel.com">support@modixpanel.com</a>{" "}
            or join our{" "}
            <a
              href="https://discord.gg/yourserver"
              target="_blank"
              rel="noreferrer"
            >
              official Discord
            </a>
            .
          </p>
        </section>

        <section>
          <h2>12. Game Logos and Third-Party Assets</h2>
          <p>
            Modix is independently developed by the Modix team. Some visual
            elements such as game logos, cover art, and Steam Workshop images
            are intellectual property of their respective owners and used solely
            for identification and aesthetic purposes.
          </p>
          <p>
            We do not claim affiliation or ownership of third-party game assets.
            Copyright and trademarks remain with their respective holders.
          </p>
          <p>
            If you are a rights holder and wish to request removal or updated
            crediting, please contact us at{" "}
            <a href="mailto:support@modixpanel.com">support@modixpanel.com</a>.
          </p>
        </section>

        <footer className="terms-footer">
          © 2025 Modix Game Panel. All rights reserved.
          <br />
          <small>
            All game logos, trademarks, and artwork are property of their
            respective owners.
          </small>
        </footer>
      </div>
    </div>
  );
};

export default Terms;
