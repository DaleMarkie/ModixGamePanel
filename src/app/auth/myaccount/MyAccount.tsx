"use client";

import React from "react";

const MyAccount = () => {
  const user = {
    name: "Jane Doe",
    username: "janedoe",
    email: "jane.doe@example.com",
    avatar: "https://i.pravatar.cc/150?u=janedoe",
    plan: "Modix Pro",
    licenseDaysLeft: 43,
    licenseStatus: "Active",
    joinedAt: "February 15, 2023",
    servers: 3,
  };

  return (
    <div className="myaccount-container">
      <h1>My Account</h1>

      {/* Compact Profile Card */}
      <div className="profile-card">
        <img src={user.avatar} alt="Avatar" className="avatar" />
        <div className="profile-details">
          <h2>{user.name}</h2>
          <p className="username">@{user.username}</p>
          <p className="email">{user.email}</p>
          <div className="meta">
            <span>
              <strong>Plan:</strong> {user.plan}
            </span>
            <span>
              <strong>Servers:</strong> {user.servers}
            </span>
            <span>
              <strong>Joined:</strong> {user.joinedAt}
            </span>
          </div>
        </div>
        <button className="delete-btn">🗑 Delete</button>
      </div>

      {/* Improved License Card */}
      <div className="license-card">
        <div className="license-top">
          <div className="license-tier">
            <span className="tier-icon">💎</span>
            <div>
              <h4>{user.plan}</h4>
              <p className="license-status">
                {user.licenseStatus} • {user.licenseDaysLeft} days left
              </p>
            </div>
          </div>
          <span className={`badge ${user.licenseStatus.toLowerCase()}`}>
            {user.licenseStatus}
          </span>
        </div>

        <div className="progress-wrapper">
          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: `${Math.min((user.licenseDaysLeft / 90) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="remaining-time">
            ⏳ {user.licenseDaysLeft} days remaining
          </p>
        </div>

        <div className="license-meta">
          <div>
            <span>📅 Joined</span>
            <p>{user.joinedAt}</p>
          </div>
          <div>
            <span>🖥️ Servers</span>
            <p>{user.servers}</p>
          </div>
          <div>
            <span>🔐 Status</span>
            <p>{user.licenseStatus}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="settings-card">
        <h3>⚙️ Profile Settings</h3>
        <form className="settings-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" defaultValue={user.name} />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" defaultValue={user.username} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue={user.email} />
          </div>
          <div className="form-group">
            <label>Change Password</label>
            <input type="password" placeholder="New password" />
          </div>
          <button type="submit" className="save-btn">
            💾 Save
          </button>
        </form>
      </div>

      <style jsx>{`
        .myaccount-container {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          font-family: "Inter", sans-serif;
          color: #e3e3e3;
          font-size: 0.75rem;
        }

        h1 {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: #b5f5ec;
          text-align: center;
        }

        .profile-card,
        .license-card,
        .settings-card {
          background: rgba(30, 30, 30, 0.95);
          border-radius: 16px;
          padding: 1.2rem;
          margin-bottom: 1.2rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid #2d2d2d;
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
        }

        .profile-details h2 {
          font-size: 0.95rem;
          margin: 0;
        }

        .username,
        .email {
          font-size: 0.7rem;
          color: #bbb;
          margin-top: 0.2rem;
        }

        .meta {
          margin-top: 0.6rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.7rem;
        }

        .delete-btn {
          background: #ff4d4f;
          border: none;
          padding: 0.4rem 0.8rem;
          color: #fff;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          margin-left: auto;
        }

        .delete-btn:hover {
          background: #d9363e;
        }

        /* Epic License Section */
        .license-card h4 {
          font-size: 0.9rem;
          margin: 0;
          color: #ffd666;
        }

        .license-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .license-tier {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .tier-icon {
          font-size: 1.2rem;
        }

        .license-status {
          font-size: 0.7rem;
          color: #aaa;
        }

        .badge {
          padding: 0.3rem 0.6rem;
          font-size: 0.65rem;
          border-radius: 6px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.active {
          background: #092b00;
          color: #52c41a;
          border: 1px solid #52c41a;
        }

        .badge.expired {
          background: #2a0708;
          color: #ff4d4f;
          border: 1px solid #ff4d4f;
        }

        .progress-wrapper {
          margin-bottom: 0.8rem;
        }

        .progress-bar {
          background: #2d2d2d;
          height: 6px;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress {
          height: 100%;
          background: linear-gradient(90deg, #13c2c2, #52c41a);
          transition: width 0.5s ease;
        }

        .remaining-time {
          font-size: 0.65rem;
          color: #999;
          margin-top: 0.3rem;
        }

        .license-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
        }

        .license-meta div span {
          color: #888;
          display: block;
        }

        .license-meta div p {
          margin: 0.2rem 0 0;
        }

        .settings-card h3 {
          font-size: 0.85rem;
          margin-bottom: 1rem;
          color: #91d5ff;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.3rem;
          font-size: 0.7rem;
          color: #aaa;
        }

        .form-group input {
          padding: 0.4rem 0.6rem;
          background: #1c1c1c;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 0.75rem;
        }

        .form-group input:focus {
          border-color: #40a9ff;
          outline: none;
        }

        .save-btn {
          align-self: flex-start;
          background: #13c2c2;
          color: #121212;
          border: none;
          padding: 0.45rem 1rem;
          font-size: 0.7rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 0.4rem;
        }

        .save-btn:hover {
          background: #08979c;
        }

        @media (max-width: 500px) {
          .profile-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .delete-btn {
            margin-left: 0;
            margin-top: 0.6rem;
          }

          .license-meta {
            flex-direction: column;
            gap: 0.4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MyAccount;
