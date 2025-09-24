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
  userName: string;
  userEmail: string;
}

export default function TicketDetails() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("id");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    // Simulated fetch for ticket
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
      userName: "Jane Doe",
      userEmail: "jane@example.com",
    };

    setTicket(mockTicket);
  }, [ticketId]);

  return (
    <main className="p-6 min-h-screen bg-[#121212] text-gray-300 font-sans flex flex-col items-center">
      {!ticket ? (
        <div className="text-center text-gray-400 mt-24">Loading ticket...</div>
      ) : (
        <div className="w-full max-w-3xl bg-gradient-to-br from-[#121212] via-[#1c1c1c] to-[#151515] rounded-lg shadow-lg p-6 space-y-6">
          <h1 className="text-3xl font-bold text-center mb-4">
            Ticket Details
          </h1>

          {/* Submitter Info */}
          <section className="bg-gray-800 rounded p-4">
            <h2 className="text-xl font-semibold mb-2">Submitted By</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
          </section>

          {/* Ticket Info */}
          <section className="bg-gray-800 rounded p-4 space-y-1">
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
          </section>

          <div className="text-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
