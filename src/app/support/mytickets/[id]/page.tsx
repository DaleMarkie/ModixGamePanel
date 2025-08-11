"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  created: string;
  updated: string;
  description: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  message: string;
  created: string;
}

export default function TicketDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fake fetch ticket data (replace with your API call)
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    // MOCK data - you should fetch from backend here
    const mockTicket: Ticket = {
      id,
      subject: "Server won't start",
      status: "open",
      priority: "high",
      created: "2025-08-05",
      updated: "2025-08-08",
      description:
        "My server fails to start after the latest update. It crashes immediately with no logs.",
      replies: [
        {
          id: "r1",
          author: "Modix Support",
          message: "Hi! Could you share the logs you see?",
          created: "2025-08-06 10:24",
        },
        {
          id: "r2",
          author: "User",
          message: "Here are the logs attached. No errors found.",
          created: "2025-08-07 08:12",
        },
      ],
    };

    // Simulate async fetch delay
    setTimeout(() => {
      setTicket(mockTicket);
      setLoading(false);
    }, 800);
  }, [id]);

  // Add a new reply (mock)
  const handleReplySubmit = () => {
    if (!newReply.trim()) return;

    const reply: Reply = {
      id: "r" + (ticket?.replies.length ?? 0 + 1),
      author: "User",
      message: newReply.trim(),
      created: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    setTicket((prev) =>
      prev
        ? {
            ...prev,
            replies: [...prev.replies, reply],
            updated: new Date().toISOString().slice(0, 10),
            status: prev.status === "closed" ? "open" : prev.status,
          }
        : prev
    );
    setNewReply("");
  };

  // Close the ticket
  const handleCloseTicket = () => {
    setTicket((prev) =>
      prev
        ? {
            ...prev,
            status: "closed",
            updated: new Date().toISOString().slice(0, 10),
          }
        : prev
    );
  };

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
      case "closed":
        return (
          <span
            className={`${baseClasses} bg-gray-700 bg-opacity-80 text-gray-300`}
          >
            Closed
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

  if (loading) {
    return (
      <main className="p-6 text-gray-300 bg-[#121212] min-h-screen">
        <p>Loading ticket details...</p>
      </main>
    );
  }

  if (error || !ticket) {
    return (
      <main className="p-6 text-gray-300 bg-[#121212] min-h-screen">
        <p>Error loading ticket. Please try again.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition"
        >
          ← Back
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto bg-gradient-to-br from-[#121212] via-[#1c1c1c] to-[#151515] rounded-lg shadow-lg min-h-screen text-gray-300 font-sans">
      <h1 className="text-3xl font-bold mb-4">{ticket.subject}</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <strong>ID:</strong> {ticket.id}
        </div>
        <div>
          <strong>Status:</strong> {getStatusBadge(ticket.status)}
        </div>
        <div>
          <strong>Priority:</strong>{" "}
          <span className={`capitalize ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>
        <div>
          <strong>Created:</strong> {ticket.created}
        </div>
        <div>
          <strong>Last Updated:</strong> {ticket.updated}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="whitespace-pre-wrap bg-[#222] p-4 rounded">
          {ticket.description}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Replies</h2>
        {ticket.replies.length === 0 && <p>No replies yet.</p>}
        <ul className="space-y-4 max-h-96 overflow-y-auto">
          {ticket.replies.map((reply) => (
            <li
              key={reply.id}
              className={`p-4 rounded ${
                reply.author === "User"
                  ? "bg-indigo-700 bg-opacity-40"
                  : "bg-gray-800"
              }`}
            >
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>{reply.author}</span>
                <span>{reply.created}</span>
              </div>
              <p className="whitespace-pre-wrap">{reply.message}</p>
            </li>
          ))}
        </ul>
      </div>

      {ticket.status !== "closed" && (
        <div className="mb-6">
          <textarea
            rows={4}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Write your reply here..."
            className="w-full p-3 rounded bg-[#222] text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleReplySubmit}
            disabled={!newReply.trim()}
            className="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition disabled:opacity-50"
          >
            Send Reply
          </button>
        </div>
      )}

      {ticket.status !== "closed" && (
        <button
          onClick={handleCloseTicket}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-semibold transition"
        >
          Close Ticket
        </button>
      )}

      {ticket.status === "closed" && (
        <p className="italic text-gray-500 mt-4">This ticket is closed.</p>
      )}

      <button
        onClick={() => router.back()}
        className="mt-8 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition"
      >
        ← Back to Tickets
      </button>
    </main>
  );
}
