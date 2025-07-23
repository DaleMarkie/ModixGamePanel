"use client";

import React, { useState, useMemo, useEffect } from "react";
import "./Faq.css";

const faqData = [
  {
    question: "How do I create a new server?",
    answer:
      "Go to the dashboard and click 'Create Server'. Follow the prompts to configure your server settings, including name, game type, and resources.",
    lastEdited: "2025-06-10",
  },
  {
    question: "Why is my server not saving progress?",
    answer:
      "Ensure the server has write permissions on the save directory. Also, check server logs for errors after shutdown and verify auto-save settings are enabled.",
    lastEdited: "2025-06-15",
  },
  {
    question: "How do I install mods via Modix?",
    answer:
      "Navigate to the 'Mods' section, browse available mods, and click 'Install' on the ones you want. Restart your server to activate them.",
    lastEdited: "2025-05-20",
  },
  {
    question: "Can I manage players and permissions?",
    answer:
      "Yes, the 'Players' panel lets you view online/offline players, ban or whitelist users, and assign roles or permissions.",
    lastEdited: "2025-06-12",
  },
  {
    question: "How do I reset my server to default settings?",
    answer:
      "Use the 'Settings' panel to restore default config files or manually delete custom configuration files from your server's file manager.",
    lastEdited: "2025-04-28",
  },
  {
    question: "What do I do if I cannot connect to my server?",
    answer:
      "Check your firewall and port forwarding rules. Make sure the server is running and your IP address is correct. Also, verify any whitelist settings.",
    lastEdited: "2025-06-18",
  },
  {
    question: "How can I get support for Modix?",
    answer:
      "Visit the 'Support' section for documentation, community forums, or to submit a ticket directly to our support team.",
    lastEdited: "2025-06-05",
  },
  {
    question: "Is there a way to check server performance stats?",
    answer:
      "Yes, the 'Tools' tab includes performance monitoring and diagnostics to help you optimize your server.",
    lastEdited: "2025-06-20",
  },
  // ... other FAQ items can have lastEdited dates added similarly
];

export default function Faq() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const filteredFaq = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return faqData.filter(
      ({ question, answer }) =>
        question.toLowerCase().includes(lower) ||
        answer.toLowerCase().includes(lower)
    );
  }, [searchTerm]);

  // Close modal on ESC key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };
    if (selectedIndex !== null) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [selectedIndex]);

  // Prevent background scroll when modal open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedIndex]);

  return (
    <>
      <div className="faq-container" aria-label="Frequently Asked Questions">
        <h1 className="faq-title">❓ Modix FAQ</h1>

        <input
          type="search"
          aria-label="Search FAQ"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="faq-search"
        />

        {filteredFaq.length === 0 ? (
          <p className="faq-no-results">
            No results found for "<strong>{searchTerm}</strong>"
          </p>
        ) : (
          filteredFaq.map(({ question }, i) => (
            <section
              key={i}
              className="faq-item"
              tabIndex={0}
              role="button"
              aria-expanded={selectedIndex === i}
              aria-controls={`faq-modal-content-${i}`}
              onClick={() => setSelectedIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedIndex(i);
                }
              }}
            >
              <h3 className="faq-question">
                {question}
                <span className="faq-arrow">{">"}</span>
              </h3>
            </section>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedIndex !== null && (
        <Modal
          question={filteredFaq[selectedIndex].question}
          answer={filteredFaq[selectedIndex].answer}
          lastEdited={filteredFaq[selectedIndex].lastEdited}
          onClose={() => setSelectedIndex(null)}
          modalId={`faq-modal-content-${selectedIndex}`}
        />
      )}
    </>
  );
}

function Modal({ question, answer, lastEdited, onClose, modalId }) {
  // Close if click outside modal content
  const onBackdropClick = (e) => {
    if (e.target.classList.contains("faq-modal-backdrop")) {
      onClose();
    }
  };

  // Format date nicely (e.g. June 10, 2025)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div
      className="faq-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-question"
      onClick={onBackdropClick}
      tabIndex={-1}
    >
      <div className="faq-modal-content" id={modalId} tabIndex={0}>
        <button
          className="faq-modal-close"
          aria-label="Close FAQ answer"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 id="modal-question" className="faq-modal-question">
          {question}
        </h2>
        <p className="faq-modal-answer">{answer}</p>
        {lastEdited && (
          <p className="faq-modal-last-edited">
            Last edited: {formatDate(lastEdited)}
          </p>
        )}
      </div>
    </div>
  );
}
