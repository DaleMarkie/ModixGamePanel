"use client";

import React, { useState, useEffect, useRef } from "react";
import "./Help.css";

const faqItems = [
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
  const [activeFaq, setActiveFaq] = useState(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveFaq(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (activeFaq && modalRef.current) {
      lastFocus.current = document.activeElement as HTMLElement;
      modalRef.current.focus();

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const trapFocus = (e: KeyboardEvent) => {
        if (e.key !== "Tab" || !focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      modalRef.current.addEventListener("keydown", trapFocus);
      return () => modalRef.current?.removeEventListener("keydown", trapFocus);
    } else {
      lastFocus.current?.focus();
    }
  }, [activeFaq]);

  return (
    <main className="help-page" aria-labelledby="help-title" role="main">
      <header className="help-header">
        <h1 id="help-title">🛠 Need Help?</h1>
        <p className="help-subtitle">
          Browse help topics or get direct assistance from the Modix team.
        </p>
      </header>

      <section className="help-sections" aria-label="Help Resources">
        {[
          {
            icon: "📖",
            title: "Documentation",
            desc: "Guides, server setup, and best practices for using Modix.",
            href: "https://modix.app/docs",
            label: "Open Modix documentation in new tab",
          },
          {
            icon: "🎫",
            title: "Support Tickets",
            desc: "Submit a request — our team is ready to help.",
            href: "/help/open-ticket",
            label: "Submit a support ticket",
          },
        ].map(({ icon, title, desc, href, label }, i) => (
          <article className="help-card" key={i} tabIndex={0}>
            <div className="card-icon" aria-hidden="true">
              {icon}
            </div>
            <h2 className="card-title">{title}</h2>
            <p className="card-desc">{desc}</p>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="card-link"
              aria-label={label}
            >
              {title === "Support Tickets"
                ? "Submit a Ticket"
                : "Open Documentation"}{" "}
              &rarr;
            </a>
          </article>
        ))}

        <article
          className="help-card faq-card"
          tabIndex={0}
          aria-labelledby="faq-heading"
        >
          <div className="card-icon" aria-hidden="true">
            ❓
          </div>
          <h2 id="faq-heading" className="card-title">
            FAQs
          </h2>
          <ul className="faq-list">
            {faqItems.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setActiveFaq(item)}
                  aria-haspopup="dialog"
                  aria-expanded={activeFaq === item}
                  aria-controls="faq-modal"
                >
                  {item.question}
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <aside className="support-note" aria-live="polite">
        🔧 <strong>Pro Tip:</strong> Always check your server logs first — they
        often tell you what’s wrong.
      </aside>

      {activeFaq && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-modal-title"
          onClick={() => setActiveFaq(null)}
        >
          <div
            className="modal-content"
            ref={modalRef}
            tabIndex={0}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="faq-modal-title">{activeFaq.question}</h3>
            <p>{activeFaq.answer}</p>
            <button
              className="modal-close"
              type="button"
              onClick={() => setActiveFaq(null)}
              autoFocus
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
