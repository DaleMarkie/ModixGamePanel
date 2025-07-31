"use client";

import React, { useState, useEffect } from "react";

const LicenseModal = ({
  visible,
  initialPlan = "personal",
  onConfirm,
  onCancel,
}) => {
  const [licensePlan, setLicensePlan] = useState(initialPlan);

  useEffect(() => {
    setLicensePlan(initialPlan);
  }, [initialPlan, visible]);

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Choose Your Modix Licensing Plan</h2>
        <p className="modal-description">
          Select the license that best fits your use case to get started with
          Modix.
        </p>

        <div className="license-options">
          <label className="license-option">
            <input
              type="radio"
              name="licensePlan"
              value="personal"
              checked={licensePlan === "personal"}
              onChange={() => setLicensePlan("personal")}
            />
            <div className="license-details">
              <span className="license-name">Personal</span>
              <span className="license-tag free-tag">FREE</span>
              <p className="license-desc">
                Ideal for individual users running Modix on a single device.
              </p>
            </div>
          </label>

          <label className="license-option disabled">
            <input type="radio" name="licensePlan" value="host" disabled />
            <div className="license-details">
              <span className="license-name">Host</span>
              <span className="license-tag coming-soon-tag">Coming Soon</span>
              <p className="license-desc">
                For server hosting environments (currently unavailable).
              </p>
            </div>
          </label>
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-primary"
            onClick={() => onConfirm(licensePlan)}
          >
            Confirm & Continue
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LicenseModal;
