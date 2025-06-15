"use client";
import React, { useState, useMemo } from "react";
import "./Support.css";

// Example: user’s support tickets
const initialTickets = [
  {
    id: "TK-3425",
    subject: "Server not saving progress",
    messages: [
      {
        from: "user",
        text: "After a restart, all progress resets. Please help!",
      },
      {
        from: "support",
        text: "Thanks for reaching out. We're investigating.",
      },
    ],
    status: "Open",
    date: "2025-06-13",
  },
  {
    id: "TK-3412",
    subject: "Can't connect to my server",
    messages: [
      { from: "user", text: "It says connection failed every time I try." },
      {
        from: "support",
        text: "Please check your firewall settings and port forwarding.",
      },
    ],
    status: "Resolved",
    date: "2025-06-10",
  },
  {
    id: "TK-3401",
    subject: "Mod not loading properly",
    messages: [
      { from: "user", text: "The Hydrocraft mod doesn't appear in-game." },
    ],
    status: "Open",
    date: "2025-06-08",
  },
];

export default function UserSupportTickets() {
  const [tickets, setTickets] = useState(initialTickets);
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(term) ||
        ticket.messages.some((m) => m.text.toLowerCase().includes(term)) ||
        ticket.status.toLowerCase().includes(term)
    );
  }, [search, tickets]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const updated = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            messages: [...t.messages, { from: "user", text: newMessage }],
          }
        : t
    );
    setTickets(updated);
    setSelectedTicket(updated.find((t) => t.id === selectedTicket.id));
    setNewMessage("");
  };

  const closeTicket = () => {
    const updated = tickets.map((t) =>
      t.id === selectedTicket.id ? { ...t, status: "Closed" } : t
    );
    setTickets(updated);
    setSelectedTicket(updated.find((t) => t.id === selectedTicket.id));
  };

  return (
    <div className="fancy-wrapper">
      <header className="fancy-header">
        <h1>📨 My Support Tickets</h1>
        {!selectedTicket && (
          <input
            type="search"
            className="search-input"
            placeholder="🔍 Search your tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </header>

      {!selectedTicket ? (
        <main className="tickets-main">
          {filtered.length === 0 ? (
            <p className="no-results">No support tickets found.</p>
          ) : (
            filtered.map((ticket) => (
              <div
                key={ticket.id}
                className="ticket-card"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="ticket-header">
                  <h3>{ticket.subject}</h3>
                  <span
                    className={`ticket-status ${
                      ticket.status === "Resolved"
                        ? "resolved"
                        : ticket.status === "Closed"
                        ? "closed"
                        : "open"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="ticket-date">Submitted: {ticket.date}</p>
                <p className="ticket-id">
                  Ticket ID: <code>{ticket.id}</code>
                </p>
              </div>
            ))
          )}
        </main>
      ) : (
        <main className="ticket-detail">
          <button
            className="back-button"
            onClick={() => setSelectedTicket(null)}
          >
            ← Back to Tickets
          </button>
          <h2>{selectedTicket.subject}</h2>
          <p>
            Status: <strong>{selectedTicket.status}</strong>
          </p>

          <div className="conversation">
            {selectedTicket.messages.map((msg, index) => (
              <div
                key={index}
                className={`message-bubble ${
                  msg.from === "user" ? "user-msg" : "support-msg"
                }`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          {selectedTicket.status !== "Closed" && (
            <div className="reply-section">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
              />
              <div className="reply-buttons">
                <button onClick={sendMessage} disabled={!newMessage.trim()}>
                  ➤ Send
                </button>
                <button onClick={closeTicket} className="close-button">
                  🛑 Close Ticket
                </button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
