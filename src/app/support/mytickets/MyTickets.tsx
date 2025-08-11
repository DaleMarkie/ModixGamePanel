"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useUser } from "../../UserContext"; // adjust path as needed

export default function MyTickets() {
  const { user, loading, authenticated } = useUser();

  const [tickets, setTickets] = useState<
    {
      id: string;
      subject: string;
      status: string;
      priority: string;
      created: string;
      updated: string;
      userId: string; // associate ticket with user
    }[]
  >([]);

  // New ticket form state
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState("medium");

  // Load tickets for the current user (simulate fetching from backend)
  useEffect(() => {
    if (!user) return;

    // Here you would fetch tickets from an API filtered by user.id
    // For demo, we simulate with static data and filter by userId
    const fetchedTickets = [
      {
        id: "TCK-001",
        subject: "Server won't start",
        status: "open",
        priority: "high",
        created: "2025-08-05",
        updated: "2025-08-08",
        userId: user.id,
      },
      {
        id: "TCK-002",
        subject: "Billing issue",
        status: "resolved",
        priority: "medium",
        created: "2025-07-30",
        updated: "2025-08-01",
        userId: "other-user-id",
      },
    ];

    // Filter tickets belonging to current user
    setTickets(fetchedTickets.filter((t) => t.userId === user.id));
  }, [user]);

  // Status badge rendering as before
  const getStatusBadge = (status: string) => {
    const baseClasses =
      "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide select-none";
    switch (status) {
      case "open":
        return (
          <span
            className={`${baseClasses} bg-red-700 bg-opacity-80 text-red-100`}
          >
            Open
          </span>
        );
      case "in-progress":
        return (
          <span
            className={`${baseClasses} bg-yellow-600 bg-opacity-80 text-yellow-100`}
          >
            In Progress
          </span>
        );
      case "resolved":
        return (
          <span
            className={`${baseClasses} bg-green-700 bg-opacity-80 text-green-100`}
          >
            Resolved
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-gray-600 bg-opacity-80 text-gray-300`}
          >
            Unknown
          </span>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const handleCreateTicket = () => {
    if (!newSubject.trim()) {
      alert("Please enter a subject for your ticket.");
      return;
    }

    const newTicket = {
      id: `TCK-${(tickets.length + 1).toString().padStart(3, "0")}`,
      subject: newSubject,
      status: "open",
      priority: newPriority,
      created: new Date().toISOString().slice(0, 10),
      updated: new Date().toISOString().slice(0, 10),
      userId: user!.id,
    };

    // Here you would post this new ticket to your backend API

    setTickets((prev) => [newTicket, ...prev]);
    setNewSubject("");
    setNewPriority("medium");
  };

  if (loading) return <div>Loading your tickets...</div>;
  if (!authenticated)
    return (
      <div className="max-w-5xl mx-auto p-6 text-gray-400">
        <p>Please log in to view your support tickets.</p>
      </div>
    );

  return (
    <main className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-[#121212] via-[#1c1c1c] to-[#151515] rounded-lg shadow-lg min-h-screen text-gray-300 font-sans">
      <header className="mb-8 flex items-center gap-3">
        <MessageSquare className="w-7 h-7 text-indigo-500" />
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          My Support Tickets
        </h1>
      </header>
      <p className="mb-6 text-gray-400 max-w-xl">
        View and track your support requests with the Modix team.
      </p>

      {/* New Ticket Form */}
      <div className="mb-6 p-4 bg-[#222] rounded shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-white">
          Create New Ticket
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <input
            type="text"
            placeholder="Subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="flex-grow px-3 py-2 rounded bg-[#333] text-white placeholder-gray-400"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="px-3 py-2 rounded bg-[#333] text-white"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button
            onClick={handleCreateTicket}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800 shadow-lg bg-[#222]">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1a1a1a]">
            <tr>
              {[
                "Ticket ID",
                "Subject",
                "Status",
                "Priority",
                "Last Updated",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  You have no tickets yet. Create one above.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="bg-[#292929] hover:bg-[#333] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-sm text-indigo-400">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-200">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                  <td
                    className={`px-6 py-4 text-sm capitalize ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {ticket.updated}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/support/mytickets/${ticket.id}`}
                      className="inline-block px-4 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition"
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
