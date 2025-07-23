import React, { useState } from "react";
import "./Support.css";

function TicketView({ ticket, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content ticket-view">
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        <h2>{ticket.subject}</h2>
        <div className="messages">
          {ticket.messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.from === "support" ? "staff" : "user"}`}
            >
              <strong>
                {msg.from === "support" ? (
                  <>
                    Staff <span className="staff-badge">✔</span>
                  </>
                ) : (
                  "You"
                )}
              </strong>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TicketModal({ onClose, onSubmit }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) return;

    const newTicket = {
      id: "TK-" + Math.floor(1000 + Math.random() * 9000), // random ID
      subject: subject.trim(),
      messages: [{ from: "user", text: message.trim() }],
      status: "Open",
      date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    };

    onSubmit(newTicket);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        <h2>🆕 Create Support Ticket</h2>

        <label>
          Subject:
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="modal-input"
            placeholder="e.g. Server won’t start"
          />
        </label>

        <label>
          Message:
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="modal-textarea"
            rows="5"
            placeholder="Explain the issue you're having..."
          />
        </label>

        <button className="modal-submit" onClick={handleSubmit}>
          ➕ Submit Ticket
        </button>
      </div>
    </div>
  );
}

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingTicket, setViewingTicket] = useState(null);

  const handleAddTicket = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  return (
    <div className="support-container">
      <h1>Support Tickets</h1>
      <button onClick={() => setShowCreateModal(true)}>+ New Ticket</button>

      <div className="ticket-list">
        {tickets.length === 0 && <p>No tickets yet.</p>}
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="ticket-item"
            onClick={() => setViewingTicket(ticket)}
          >
            <strong>{ticket.subject}</strong> — {ticket.status} — {ticket.date}
          </div>
        ))}
      </div>

      {showCreateModal && (
        <TicketModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleAddTicket}
        />
      )}

      {viewingTicket && (
        <TicketView
          ticket={viewingTicket}
          onClose={() => setViewingTicket(null)}
        />
      )}
    </div>
  );
}
