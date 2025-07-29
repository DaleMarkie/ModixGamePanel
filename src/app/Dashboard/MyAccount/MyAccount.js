import React, { useState } from "react";
import "./MyAccount.css";

const MyAccount = () => {
  const [username] = useState("OV3RLORD");
  const [email, setEmail] = useState("overlord@example.com");
  const [newEmail, setNewEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailChange = (e) => {
    e.preventDefault();
    if (!newEmail.includes("@")) return alert("Enter a valid email address.");
    setEmail(newEmail);
    setNewEmail("");
    alert("Email updated successfully.");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    alert("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="myaccount-wrapper">
      <div className="account-container">
        <h1>🧑 My Account</h1>

        <div className="card-section">
          <h2>👤 Personal Information</h2>
          <div className="info-line"><span>Username:</span> <strong>{username}</strong></div>
          <div className="info-line"><span>Email:</span> <strong>{email}</strong></div>
        </div>

        <div className="card-section">
          <h2>✉️ Change Email</h2>
          <form onSubmit={handleEmailChange}>
            <input
              type="email"
              placeholder="Enter new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <button type="submit">Update Email</button>
          </form>
        </div>

        <div className="card-section">
          <h2>🔒 Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
