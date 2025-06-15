"use client";

import React from "react";
import "./Privacy.css"; // Using the same CSS file

const Privacy = () => {
  return (
    <div className="terms-container">
      <div className="terms-content">
        <h1>Modix Privacy Policy</h1>
        <p className="last-updated">Last Updated: June 15, 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            At Modix Game Panel ("Modix"), your privacy is of utmost importance
            to us. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>
              Personal information you provide directly (e.g., name, email,
              username)
            </li>
            <li>
              Technical data such as IP address, browser type, and usage logs
            </li>
            <li>
              Information related to your interactions with mods and server
              settings
            </li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide, maintain, and improve Modix services</li>
            <li>Authenticate users and secure your account</li>
            <li>
              Communicate important updates, support, and promotional content
            </li>
            <li>Analyze usage trends and improve user experience</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>
          <p>
            We do not sell or rent your personal information to third parties.
            We may share your data with trusted service providers who assist us
            in operating Modix, subject to confidentiality agreements.
          </p>
          <p>
            We may also disclose information to comply with legal obligations or
            protect our rights and users' safety.
          </p>
        </section>

        <section>
          <h2>5. Cookies and Tracking Technologies</h2>
          <p>
            Modix uses cookies and similar tracking technologies to enhance your
            experience, analyze usage, and customize content. You can manage
            your cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We implement reasonable technical and organizational measures to
            protect your data from unauthorized access, alteration, disclosure,
            or destruction.
          </p>
          <p>
            However, no internet transmission or storage system is completely
            secure. Use Modix at your own risk.
          </p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>
            Depending on your location, you may have rights regarding your
            personal data, including access, correction, deletion, and objection
            to processing. Contact us to exercise these rights.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Modix is not intended for users under the age of 16. We do not
            knowingly collect data from children under 16 If you believe we have
            inadvertently collected such data, please contact us to request
            deletion.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Continued use of
            Modix after updates signifies acceptance of the changes. We
            encourage you to review this page regularly.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please
            contact us at{" "}
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

        <footer className="terms-footer">
          © 2025 Modix Game Panel. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Privacy;
