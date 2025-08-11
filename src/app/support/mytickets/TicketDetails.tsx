"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../UserContext"; // Adjust path as needed

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created: string;
  updated: string;
}

export default function TicketDetails() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("id");
  const { user, loading: userLoading, authenticated } = useUser();

  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    // Simulate fetching ticket by ID (replace with real API call)
    const mockTicket: Ticket = {
      id: ticketId,
      subject: "Server won't start",
      status: "open",
      priority: "high",
      created: "2025-08-05",
      updated: "2025-08-08",
    };

    setTicket(mockTicket);
  }, [ticketId]);

  if (!ticket) {
    return (
      <main className="p-6 text-gray-300 bg-[#121212] min-h-screen">
        <p>Loading ticket...</p>
      </main>
    );
  }

  if (userLoading) {
    return (
      <main className="p-6 text-gray-300 bg-[#121212] min-h-screen">
        <p>Loading user info...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto bg-gradient-to-br from-[#121212] via-[#1c1c1c] to-[#151515] rounded-lg shadow-lg min-h-screen text-gray-300 font-sans">
      <h1 className="text-3xl font-bold mb-4">Ticket Details</h1>

      {/* Show user info so support knows who is contacting */}
      {authenticated && user ? (
        <div className="mb-6 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-2">User Info</h2>
          <p>
            <strong>Name:</strong> {user.name || user.username || "User"}
          </p>
          <p>
            <strong>Username:</strong> @{user.username || "unknown"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "No email provided"}
          </p>
          <p>
            <strong>User ID:</strong> {user.id || "N/A"}
          </p>
        </div>
      ) : (
        <p className="mb-6 italic text-gray-500">User not logged in.</p>
      )}

      <p className="mb-2">
        <strong>ID:</strong> {ticket.id}
      </p>
      <p className="mb-2">
        <strong>Subject:</strong> {ticket.subject}
      </p>
      <p className="mb-2">
        <strong>Status:</strong> {ticket.status}
      </p>
      <p className="mb-2">
        <strong>Priority:</strong> {ticket.priority}
      </p>
      <p className="mb-2">
        <strong>Created:</strong> {ticket.created}
      </p>
      <p className="mb-6">
        <strong>Last Updated:</strong> {ticket.updated}
      </p>

      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition"
      >
        Back to Tickets
      </button>
    </main>
  );
}
