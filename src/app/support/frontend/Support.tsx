"use client";
import React, { useState, useMemo, useCallback } from "react";
import "./Support.css"; // or Tailwind, your call

// Add priority & assigned support staff for richer info
const initialTickets = [
  {
    id: "TK-3425",
    subject: "Server not saving progress",
    category: "Server",
    priority: "High",
    assignedTo: "Alice",
    messages: [
      {
        from: "user",
        text: "After a restart, all progress resets. Please help!",
        timestamp: "2025-06-13T09:30:00Z",
      },
      {
        from: "support",
        text: "Thanks for reaching out. We're investigating.",
        timestamp: "2025-06-13T10:00:00Z",
      },
    ],
    status: "Open",
    date: "2025-06-13",
  },
  {
    id: "TK-3412",
    subject: "Can't connect to my server",
    category: "Connection",
    priority: "Medium",
    assignedTo: "Bob",
    messages: [
      {
        from: "user",
        text: "It says connection failed every time I try.",
        timestamp: "2025-06-10T08:15:00Z",
      },
      {
        from: "support",
        text: "Please check your firewall settings and port forwarding.",
        timestamp: "2025-06-10T08:45:00Z",
      },
    ],
    status: "Resolved",
    date: "2025-06-10",
  },
  {
    id: "TK-3401",
    subject: "Mod not loading properly",
    category: "Mods",
    priority: "Low",
    assignedTo: null,
    messages: [
      {
        from: "user",
        text: "The Hydrocraft mod doesn't appear in-game.",
        timestamp: "2025-06-08T14:20:00Z",
      },
    ],
    status: "Open",
    date: "2025-06-08",
  },
];

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Mods", label: "🧩 Mods" },
  { value: "Server", label: "🖥️ Server" },
  { value: "Billing", label: "💳 Billing" },
  { value: "Connection", label: "🌐 Connection" },
  { value: "Other", label: "❓ Other" },
];

const STATUS_OPTIONS = ["Open", "Closed", "Resolved", "Pending"];

export default function UserSupportTickets() {
  // Core States
  const [tickets, setTickets] = useState(initialTickets);
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);

  // New ticket form states
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newInitialMessage, setNewInitialMessage] = useState("");

  // Reply states
  const [newMessage, setNewMessage] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Memoized filtered tickets with multiple filters and search
  const filteredTickets = useMemo(() => {
    const term = search.toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.subject.toLowerCase().includes(term) ||
        ticket.messages.some((m) => m.text.toLowerCase().includes(term)) ||
        ticket.status.toLowerCase().includes(term);

      const matchesStatus = filterStatus
        ? ticket.status === filterStatus
        : true;
      const matchesCategory = filterCategory
        ? ticket.category === filterCategory
        : true;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [search, tickets, filterStatus, filterCategory]);

  // Send reply to selected ticket
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedTicket) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  from: "user",
                  text: newMessage.trim(),
                  timestamp: new Date().toISOString(),
                },
              ],
              status: "Pending", // Update status to Pending to notify support
            }
          : t
      )
    );

    setSelectedTicket((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          from: "user",
          text: newMessage.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
      status: "Pending",
    }));

    setNewMessage("");
  }, [newMessage, selectedTicket]);

  // Close selected ticket
  const closeTicket = useCallback(() => {
    if (!selectedTicket) return;
    if (!window.confirm("Are you sure you want to close this ticket?")) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id ? { ...t, status: "Closed" } : t
      )
    );
    setSelectedTicket((prev) => ({ ...prev, status: "Closed" }));
  }, [selectedTicket]);

  // Create new ticket
  const createTicket = useCallback(() => {
    if (!newSubject.trim() || !newInitialMessage.trim() || !newCategory) return;

    const newTicket = {
      id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newSubject.trim(),
      category: newCategory,
      priority: newPriority,
      assignedTo: null,
      messages: [
        {
          from: "user",
          text: newInitialMessage.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
      status: "Open",
      date: new Date().toISOString().split("T")[0],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setNewSubject("");
    setNewInitialMessage("");
    setNewCategory("");
    setNewPriority("Medium");
    setCreatingNew(false);
  }, [newSubject, newInitialMessage, newCategory, newPriority]);

  // Format timestamp nicely
  const formatTimestamp = (ts) => {
    try {
      const date = new Date(ts);
      return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="support-wrapper max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <header className="support-header mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            🎧 Support Center
          </h1>

          {!selectedTicket && !creatingNew && (
            <button
              className="btn-primary px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={() => setCreatingNew(true)}
              aria-label="Create new support ticket"
            >
              ➕ New Ticket
            </button>
          )}
        </div>

        {!selectedTicket && !creatingNew && (
          <>
            <div className="flex gap-4 mb-4 flex-wrap">
              <input
                type="search"
                className="search-input border rounded px-3 py-2 flex-grow min-w-[250px]"
                placeholder="Search tickets by subject, message, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search tickets"
              />
              <select
                className="border rounded px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by ticket status"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="border rounded px-3 py-2"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Filter by ticket category"
              >
                {CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </header>

      {/* New Ticket Form */}
      {creatingNew && (
        <main className="ticket-form bg-gray-50 p-6 rounded shadow">
          <button
            className="btn-back text-blue-600 hover:underline mb-4"
            onClick={() => setCreatingNew(false)}
            aria-label="Back to ticket list"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-semibold mb-4">
            Create New Support Ticket
          </h2>

          <input
            className="form-input w-full mb-3 border rounded px-3 py-2"
            placeholder="Subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            aria-required="true"
            aria-label="Ticket subject"
          />

          <select
            className="form-select w-full mb-3 border rounded px-3 py-2"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            aria-required="true"
            aria-label="Ticket category"
          >
            <option value="" disabled>
              Select category...
            </option>
            {CATEGORIES.filter((c) => c.value).map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            className="form-select w-full mb-3 border rounded px-3 py-2"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            aria-label="Ticket priority"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          <textarea
            className="form-textarea w-full mb-4 border rounded px-3 py-2 resize-y"
            rows={5}
            placeholder="Describe your issue..."
            value={newInitialMessage}
            onChange={(e) => setNewInitialMessage(e.target.value)}
            aria-required="true"
            aria-label="Initial message"
          />

          <div className="flex gap-3">
            <button
              className="btn-primary bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              disabled={
                !newSubject.trim() || !newInitialMessage.trim() || !newCategory
              }
              onClick={createTicket}
              aria-label="Submit new ticket"
            >
              Submit Ticket
            </button>
            <button
              className="btn-secondary bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              onClick={() => setCreatingNew(false)}
              aria-label="Cancel new ticket"
            >
              Cancel
            </button>
          </div>
        </main>
      )}

      {/* Ticket List */}
      {!selectedTicket && !creatingNew && (
        <main className="ticket-list overflow-auto max-h-[500px]">
          {filteredTickets.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No tickets found.</p>
          ) : (
            filteredTickets.map((ticket) => (
              <article
                key={ticket.id}
                tabIndex={0}
                role="button"
                className="ticket-item border rounded p-4 mb-3 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setSelectedTicket(ticket)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedTicket(ticket);
                  }
                }}
                aria-label={`Open ticket ${ticket.subject} status ${ticket.status}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                  <span
                    className={`status-badge px-2 py-1 rounded text-sm font-medium ${
                      {
                        Open: "bg-green-200 text-green-800",
                        Pending: "bg-yellow-200 text-yellow-800",
                        Resolved: "bg-blue-200 text-blue-800",
                        Closed: "bg-gray-300 text-gray-600",
                      }[ticket.status] || "bg-gray-200 text-gray-700"
                    }`}
                    aria-label={`Status: ${ticket.status}`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Category:</strong> {ticket.category || "N/A"} |{" "}
                  <strong>Priority:</strong> {ticket.priority} |{" "}
                  <strong>Assigned:</strong> {ticket.assignedTo || "Unassigned"}
                </p>
                <p className="text-xs text-gray-500">
                  Created on: {ticket.date} | Messages: {ticket.messages.length}
                </p>
              </article>
            ))
          )}
        </main>
      )}

      {/* Ticket Detail */}
      {selectedTicket && (
        <main className="ticket-detail p-4 border rounded shadow max-h-[600px] overflow-auto flex flex-col">
          <button
            className="btn-back text-blue-600 hover:underline mb-4 self-start"
            onClick={() => setSelectedTicket(null)}
            aria-label="Back to ticket list"
          >
            ← Back to tickets
          </button>

          <header className="mb-4">
            <h2 className="text-2xl font-semibold mb-1">
              {selectedTicket.subject}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Category:</strong> {selectedTicket.category || "N/A"} |{" "}
              <strong>Priority:</strong> {selectedTicket.priority} |{" "}
              <strong>Status:</strong> {selectedTicket.status} |{" "}
              <strong>Assigned to:</strong>{" "}
              {selectedTicket.assignedTo || "Unassigned"}
            </p>
            <p className="text-xs text-gray-500">
              Created on: {selectedTicket.date}
            </p>
          </header>

          <section className="messages flex-grow overflow-auto mb-4">
            {selectedTicket.messages.map((msg, i) => (
              <div
                key={i}
                className={`message mb-3 p-3 rounded ${
                  msg.from === "user"
                    ? "bg-blue-50 text-blue-900 self-end max-w-[70%]"
                    : "bg-gray-100 text-gray-800 max-w-[70%]"
                }`}
                role="article"
                aria-label={`${
                  msg.from === "user" ? "Your message" : "Support reply"
                } on ${formatTimestamp(msg.timestamp)}`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <time
                  className="text-xs text-gray-500 block mt-1"
                  dateTime={msg.timestamp}
                >
                  {formatTimestamp(msg.timestamp)}
                </time>
              </div>
            ))}
          </section>

          <footer className="flex flex-col gap-3">
            {selectedTicket.status !== "Closed" ? (
              <>
                <textarea
                  className="form-textarea w-full border rounded px-3 py-2 resize-y"
                  rows={3}
                  placeholder="Write your reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  aria-label="Reply message"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    className="btn-primary bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    disabled={!newMessage.trim()}
                    onClick={sendMessage}
                    aria-label="Send reply"
                  >
                    Send Reply
                  </button>
                  <button
                    className="btn-secondary bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    onClick={closeTicket}
                    aria-label="Close ticket"
                  >
                    Close Ticket
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-600 italic">
                This ticket is closed.
              </p>
            )}
          </footer>
        </main>
      )}
    </div>
  );
}
