import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TicketView.css";

const dummyTickets = {
  "TCK-001": {
    subject: "Server won't start",
    status: "Open",
    messages: [
      { from: "user", text: "Server hangs on start." },
      { from: "support", text: "Please send logs for review." }
    ]
  },
  "TCK-002": {
    subject: "Mod install failed",
    status: "Closed",
    messages: [
      { from: "user", text: "Mod failed to install." },
      { from: "support", text: "Resolved in latest patch." }
    ]
  }
};

const TicketView = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    const found = dummyTickets[ticketId];
    if (found) setTicket({ id: ticketId, ...found });
  }, [ticketId]);

  const sendReply = () => {
    if (reply.trim()) {
      setTicket((prev) => ({
        ...prev,
        messages: [...prev.messages, { from: "user", text: reply }]
      }));
      setReply("");
    }
  };

  if (!ticket) {
    return (
      <div className="boxed-support-container">
        <div className="support-header">
          <h1>❌ Ticket Not Found</h1>
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
        <div className="support-box">
          <p style={{ color: "#999" }}>No ticket with ID {ticketId} was found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="boxed-support-container">
      <div className="support-header">
        <h1>🧾 Ticket #{ticket.id}</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="support-box">
        <div className="ticket-meta">
          <h2>{ticket.subject}</h2>
          <span className={`status-badge ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
        </div>

        <div className="messages-list">
          {ticket.messages.map((msg, i) => (
            <div key={i} className={`message-bubble ${msg.from}`}>
              <div className="message-meta">
                <span className="author">{msg.from === "user" ? "You" : "Support"}</span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
        </div>

        {ticket.status === "Open" ? (
          <>
            <textarea
              className="reply-input"
              rows="4"
              placeholder="Type your reply here..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <button className="submit-btn" onClick={sendReply}>Send Reply</button>
          </>
        ) : (
          <p className="ticket-closed-note">🛑 This ticket is closed and cannot be replied to.</p>
        )}
      </div>
    </div>
  );
};

export default TicketView;
