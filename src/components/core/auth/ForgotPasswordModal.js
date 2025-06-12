import React, { useState } from "react";

const ForgotPasswordModal = ({ visible, onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    // TODO: Add real password reset request logic here
    setMessage(`Password reset link sent to ${email}.`);

    // Optionally clear email input
    setEmail("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link.</p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <input
            type="email"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {message && <div className="modal-message">{message}</div>}

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              Send Reset Link
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setMessage("");
                setEmail("");
                onClose();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
