"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category?: string;
  page?: string;
  created: string;
  updated: string;
  userId: string;
  userName: string; // ✅ submitter's name
  userEmail: string; // ✅ submitter's email
}

export default function TicketDetails() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("id");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    // Simulated fetch for ticket, include submitter's info
    const mockTicket: Ticket = {
      id: ticketId,
      subject: "Server won't start",
      status: "open",
      priority: "high",
      category: "bug",
      page: "dashboard",
      created: "2025-08-05",
      updated: "2025-08-08",
      userId: "user-123",
      userName: "Jane Doe", // ✅ actual submitter
      userEmail: "jane@example.com", // ✅ actual submitter
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

  return (
    <main className="p-6 max-w-3xl mx-auto bg-gradient-to-br from-[#121212] via-[#1c1c1c] to-[#151515] rounded-lg shadow-lg min-h-screen text-gray-300 font-sans">
      <h1 className="text-3xl font-bold mb-4">Ticket Details</h1>

      {/* Show ticket submitter info */}
      <div className="mb-6 p-4 bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">Submitted By</h2>
        <p>
          <strong>Name:</strong> {ticket.userName}
        </p>
        <p>
          <strong>Email:</strong> {ticket.userEmail}
        </p>
        <p>
          <strong>User ID:</strong> {ticket.userId}
        </p>
      </div>

      <div className="ticket-details mb-6">
        <p>
          <strong>Ticket ID:</strong> {ticket.id}
        </p>
        <p>
          <strong>Subject:</strong> {ticket.subject}
        </p>
        <p>
          <strong>Category:</strong> {ticket.category || "General"}
        </p>
        <p>
          <strong>Page:</strong> {ticket.page || "Dashboard"}
        </p>
        <p>
          <strong>Status:</strong> {ticket.status}
        </p>
        <p>
          <strong>Priority:</strong> {ticket.priority}
        </p>
        <p>
          <strong>Created:</strong> {ticket.created}
        </p>
        <p>
          <strong>Last Updated:</strong> {ticket.updated}
        </p>
      </div>

      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition"
      >
        Back to Tickets
      </button>
    </main>
  );
}
