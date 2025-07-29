import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Support.css";

const mockTickets = [
  {
    id: "TCK-001",
    subject: "Server won't start",
    status: "Open",
    date: "2025-06-05",
    messages: [
      { from: "user", text: "Server hangs on start." },
      { from: "support", text: "Please send logs for review." }
    ]
  },
  {
    id: "TCK-002",
    subject: "Mod install failed",
    status: "Closed",
    date: "2025-05-22",
    messages: [
      { from: "user", text: "Mod failed to install." },
      { from: "support", text: "Resolved in latest patch." }
    ]
  }
];

const Support = () => {
  const navigate = useNavigate();
  const [tickets] = useState(mockTickets);

  return (
    <div className="boxed-support-container">
      <div className="support-header">
        <h1>📩 Support Center</h1>
        <div>
          <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
          <Link to="/support/create">
            <button className="create-btn">+ New Ticket</button>
          </Link>
        </div>
      </div>

      <div className="support-box">
        <h2>Your Tickets</h2>
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card clickable"
              onClick={() => navigate(`/ticket/${ticket.id}`)}
            >
              <div className="ticket-header">
                <span className="ticket-id">#{ticket.id}</span>
                <span className={`status-badge ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
              </div>
              <h3>{ticket.subject}</h3>
              <p className="ticket-date">Submitted: {ticket.date}</p>
            </div>
          ))
        ) : (
          <p className="no-tickets">You have no support tickets.</p>
        )}
      </div>
    </div>
  );
};

export default Support;
