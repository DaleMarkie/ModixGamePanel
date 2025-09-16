"use client";

import React, { useState, useEffect, useRef } from "react";
import "./Help.css";

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What is Modix?",
    answer:
      "Go to the Mod Manager tab, paste the Steam Workshop ID of the mod, then click 'Install'. Modix will handle the rest.",
  },
  {
    question: "Is Modix Free?",
    answer:
      "Yes, but free and personal licenses are limited to one server. For multiple servers, consider upgrading your plan under Settings.",
  },
  {
    question: "How To Use",
    answer:
      "Click the Support Tickets box below or visit the Dashboard and open a new ticket under 'Technical Support'.",
  },
];

export default function Help() {
  const [modalContent, setModalContent] = useState<FaqItem | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Close modal on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalContent(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Manage focus trap & restore focus after modal closes
  useEffect(() => {
    if (modalContent) {
      lastFocusedElement.current = document.activeElement as HTMLElement | null;
      modalRef.current?.focus();

      // Simple focus trap: cycle focus within modal
      const focusableSelectors =
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusableElements = modalRef.current
        ? Array.from(
            modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
          )
        : [];

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl?.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl?.focus();
          }
        }
      };

      modalRef.current?.addEventListener("keydown", handleTab);
      return () => modalRef.current?.removeEventListener("keydown", handleTab);
    } else {
      // Restore focus to last focused element before modal opened
      lastFocusedElement.current?.focus();
    }
  }, [modalContent]);

  return (
    <main
      className="help-page"
      aria-labelledby="help-title"
      role="main"
      tabIndex={-1}
    >
      <header className="help-header">
        <h1 id="help-title" className="help-title">
          🛠 Need Help?
        </h1>
        <p className="help-subtitle">
          Explore the sections below or get direct support from the Modix team.
        </p>
      </header>

      <section className="help-sections" aria-label="Help Sections">
        {/* Documentation */}
        <article className="help-card" tabIndex={0}>
          <div className="card-icon" aria-hidden="true">
            📖
          </div>
          <h2 className="card-title">Documentation</h2>
          <p className="card-desc">
            Step-by-step instructions, configuration help, and best practices
            for managing your server.
          </p>
          <a
            href="https://modix.app/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="card-link"
            aria-label="Open Modix documentation in new tab"
          >
            Open Documentation &rarr;
          </a>
        </article>

        {/* Support Tickets */}
        <article className="help-card" tabIndex={0}>
          <div className="card-icon" aria-hidden="true">
            🎫
          </div>
          <h2 className="card-title">Support Tickets</h2>
          <p className="card-desc">
            Submit a support request and our team will help you resolve your
            issue quickly.
          </p>
          <a
            href="/help/open-ticket"
            className="card-link"
            aria-label="Submit a support ticket"
          >
            Submit a Ticket &rarr;
          </a>
        </article>

        {/* FAQ */}
        <article
          className="help-card faq-card"
          aria-labelledby="faq-heading"
          tabIndex={0}
        >
          <div className="card-icon" aria-hidden="true">
            ❓
          </div>
          <h2 id="faq-heading" className="card-title">
            Frequently Asked Questions
          </h2>
          <ul className="faq-list">
            {faqItems.map((item, idx) => (
              <li key={idx}>
                <button
                  className="faq-question"
                  onClick={() => setModalContent(item)}
                  aria-expanded={modalContent === item}
                  aria-controls="faq-modal"
                  aria-haspopup="dialog"
                  type="button"
                >
                  {item.question}
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <aside className="support-note" aria-live="polite">
        🔧 <strong>Pro Tip:</strong> If something breaks, always check the
        server logs — they usually tell you exactly what went wrong.
      </aside>

      {/* Modal */}
      {modalContent && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-modal-title"
          onClick={() => setModalContent(null)}
          tabIndex={-1}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
            tabIndex={0}
          >
            <h3 id="faq-modal-title">{modalContent.question}</h3>
            <p>{modalContent.answer}</p>
            <button
              className="modal-close"
              onClick={() => setModalContent(null)}
              aria-label="Close modal"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
