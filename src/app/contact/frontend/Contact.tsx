"use client";

import React, { useState } from "react";
import "./contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Sending...");
    setTimeout(() => {
      setStatus(null);
      setShowPopup(true);
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="contact-container">
      <div className="contact-content">
        <h1 className="contact-title">Contact Modix Support</h1>
        <p className="contact-description">
          Have questions, feedback, or need assistance? We’re here to help! Fill
          out the form below or reach out directly via email or Discord.
        </p>

        <div className="contact-grid">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                id="name"
                name="name"
                type="text"
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
                required
              />
              <label htmlFor="name">Name</label>
            </div>

            <div className="input-group">
              <input
                id="email"
                name="email"
                type="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="input-group">
              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder=" "
                value={formData.message}
                onChange={handleChange}
                required
              />
              <label htmlFor="message">Message</label>
            </div>

            <button type="submit" className="btn-submit" disabled={!!status}>
              {status || "Send Message"}
            </button>
          </form>

          <div className="contact-info">
            <h2>Contact Info</h2>
            <p>
              Email:{" "}
              <a
                href="mailto:support@modixpanel.com"
                target="_blank"
                rel="noreferrer"
              >
                support@modixpanel.com
              </a>
            </p>
            <p>
              Discord:{" "}
              <a
                href="https://discord.gg/EwWZUSR9t"
                target="_blank"
                rel="noreferrer"
              >
                Join our official Discord
              </a>
            </p>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
          >
            <h3 id="popup-title">Message Sent</h3>
            <p>
              Thank you for contacting us! Someone will reach out to you by
              email within 1 - 2 working days.
            </p>
            <p>
              Meanwhile, join our{" "}
              <a
                href="https://discord.gg/EwWZUSR9t"
                target="_blank"
                rel="noreferrer"
                className="popup-discord-link"
              >
                Discord community
              </a>{" "}
              for support and updates.
            </p>
            <button
              onClick={closePopup}
              className="popup-close-btn"
              aria-label="Close popup"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
