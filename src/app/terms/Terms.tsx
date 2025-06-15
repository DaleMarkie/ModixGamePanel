"use client";

import React from "react";
import "./terms.css";

const Terms = () => {
  return (
    <div className="terms-container">
      <div className="terms-content">
        <h1>Modix Terms of Use</h1>
        <p className="last-updated">Last Updated: June 15, 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Modix Game Panel ("Modix"), you agree to
            be bound by these Terms of Use, our Privacy Policy, and any
            additional policies or guidelines applicable to specific features.
            If you do not agree, you must discontinue use of Modix.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 16 years old or the minimum age of digital
            consent in your country to use this platform. Accounts registered by
            bots or automated tools are not permitted.
          </p>
        </section>

        <section>
          <h2>3. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and all activities that occur under your
            account. Modix is not liable for any loss or damage arising from
            unauthorized use.
          </p>
        </section>

        <section>
          <h2>4. Permitted Use</h2>
          <p>
            You agree not to misuse Modix. This includes, but is not limited to:
          </p>
          <ul>
            <li>Attempting to gain unauthorized access to the system</li>
            <li>Reverse engineering or modifying any part of Modix</li>
            <li>Hosting illegal content or violating third-party rights</li>
          </ul>
        </section>

        <section>
          <h2>5. Mod Content and Licensing</h2>
          <p>
            Modix does not host or own workshop mods. All mods remain the
            property of their respective creators. You are responsible for
            ensuring that your use of mods complies with the Steam Workshop
            Terms and relevant licenses.
          </p>
        </section>

        <section>
          <h2>6. Payment and Licensing</h2>
          <p>
            Modix offers a free Personal License and may offer paid Hosting
            Licenses in the future. You may not resell, sublicense, or share
            your license key. All license plans are non-transferable.
          </p>
        </section>

        <section>
          <h2>7. Termination</h2>
          <p>
            We reserve the right to suspend or permanently terminate accounts
            for violations of these terms, abusive behavior, or legal
            infractions. You may cancel your account at any time.
          </p>
        </section>

        <section>
          <h2>8. Availability and Uptime</h2>
          <p>
            While we strive to maintain high availability, we do not guarantee
            uninterrupted service. Planned maintenance and unforeseen
            circumstances may affect uptime.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            Modix is provided "as-is" without warranties of any kind. We are not
            liable for data loss, mod corruption, downtime, or any indirect
            damages resulting from your use of the platform.
          </p>
        </section>

        <section>
          <h2>10. Modifications to Terms</h2>
          <p>
            We may update these Terms of Use at any time. Continued use of Modix
            after changes constitutes your acceptance of the revised terms. We
            recommend reviewing this page periodically.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            If you have questions or concerns about these terms, please contact
            us at{" "}
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
            Modix is an independently developed server management panel. While
            the Modix team created the entire platform, user interface, and
            backend functionality, some visual elements—including game logos,
            cover art, and Steam Workshop images—are the intellectual property
            of their respective game developers and publishers.
          </p>
          <p>
            These assets are used solely for visual enhancement and
            identification purposes. Modix does not claim ownership or
            affiliation with any third-party game unless explicitly stated.
            Copyrights and trademarks remain with their original holders.
          </p>
          <p>
            If you are a rights holder and wish for your content to be removed
            or credited differently, please contact us at{" "}
            <a href="mailto:support@modixpanel.com">support@modixpanel.com</a>.
          </p>
        </section>

        <footer className="terms-footer">
          © 2025 Modix Game Panel. All rights reserved. <br />
          <small>
            All game logos, trademarks, and artwork are the property of their
            respective owners.
          </small>
        </footer>
      </div>
    </div>
  );
};

export default Terms;
