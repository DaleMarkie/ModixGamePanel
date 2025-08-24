"use client";

import React, { useEffect, useState } from "react";
import "./MyTickets.css"; // CSS import
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useUser } from "../../UserContext";

export default function MyTickets() {
  const { user, loading, authenticated } = useUser();

  const [tickets, setTickets] = useState<
    {
      id: string;
      subject: string;
      status: string;
      priority: string;
      category: string;
      page: string;
      created: string;
      updated: string;
      userId: string; // associate with logged-in user
    }[]
  >([]);

  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newCategory, setNewCategory] = useState("general");
  const [newPage, setNewPage] = useState("dashboard");

  useEffect(() => {
    if (!user) return;

    // Simulate fetching tickets for this user
    const fetchedTickets = [
      {
        id: "TCK-001",
        subject: "Server won't start",
        status: "open",
        priority: "high",
        category: "bug",
        page: "dashboard",
        created: "2025-08-05",
        updated: "2025-08-08",
        userId: user.id,
      },
      {
        id: "TCK-002",
        subject: "Billing issue",
        status: "resolved",
        priority: "medium",
        category: "billing",
        page: "billing",
        created: "2025-07-30",
        updated: "2025-08-01",
        userId: "other-user-id",
      },
    ];

    // Only show tickets belonging to current user
    setTickets(fetchedTickets.filter((t) => t.userId === user.id));
  }, [user]);

  const handleCreateTicket = () => {
    if (!newSubject.trim() || !user) {
      alert("Please enter a subject for your ticket.");
      return;
    }

    const newTicket = {
      id: `TCK-${(tickets.length + 1).toString().padStart(3, "0")}`,
      subject: newSubject,
      status: "open",
      priority: newPriority,
      category: newCategory,
      page: newPage,
      created: new Date().toISOString().slice(0, 10),
      updated: new Date().toISOString().slice(0, 10),
      userId: user.id, // ✅ associate with logged-in user
    };

    // Add to local state (and optionally post to backend)
    setTickets((prev) => [newTicket, ...prev]);

    // Reset form
    setNewSubject("");
    setNewPriority("medium");
    setNewCategory("general");
    setNewPage("dashboard");
  };

  if (loading) return <div>Loading your tickets...</div>;
  if (!authenticated)
    return (
      <div className="mytickets-not-auth">
        Please log in to view your tickets.
      </div>
    );

  return (
    <main className="mytickets-container">
      <header className="mytickets-header">
        <MessageSquare className="icon" />
        <h1>My Support Tickets</h1>
      </header>

      <p className="mytickets-subtext">
        View and track your support requests with the Modix team.
      </p>

      {/* New Ticket Form */}
      <div className="ticket-form">
        <h2>Create New Ticket</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />

          <select
            className="styled-select"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          >
            <option value="general">General</option>
            <option value="bug">Bug Report</option>
            <option value="billing">Billing</option>
            <option value="feature">Feature Request</option>
            <option value="other">Other</option>
          </select>

          <select
            className="styled-select"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <select
            className="styled-select"
            value={newPage}
            onChange={(e) => setNewPage(e.target.value)}
          >
            <option value="dashboard">Dashboard</option>
            <option value="billing">Billing</option>
            <option value="settings">Settings</option>
            <option value="support">Support</option>
            <option value="profile">Profile</option>
            <option value="other">Other</option>
          </select>

          <button onClick={handleCreateTicket}>Submit</button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="ticket-table">
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Page</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-tickets">
                  You have no tickets yet. Create one above.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="ticket-row">
                  <td className="ticket-id">{ticket.id}</td>
                  <td>{ticket.subject}</td>
                  <td className={`category-badge category-${ticket.category}`}>
                    {ticket.category}
                  </td>
                  <td className={`page-badge page-${ticket.page}`}>
                    {ticket.page}
                  </td>
                  <td>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className={`priority-badge priority-${ticket.priority}`}>
                    {ticket.priority}
                  </td>
                  <td>{ticket.updated}</td>
                  <td>
                    <Link
                      href={`/support/mytickets/${ticket.id}`}
                      className="ticket-action"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
