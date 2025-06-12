import React, { useState } from "react";
import "./Help.css";

const Help = () => {
  const [modalContent, setModalContent] = useState(null);

  const faq = [
    {
      question: "What is Modix?",
      answer: "Go to the Mod Manager tab, paste the Steam Workshop ID of the mod, then click 'Install'. Modix will handle the rest.",
    },
    {
      question: "Is Modix Free?",
      answer: "Yes, but free and personal licenses are limited to one server. For multiple servers, consider upgrading your plan under Settings.",
    },
    {
      question: "How To USe",
      answer: "Click the Support Tickets box below or visit the Dashboard and open a new ticket under 'Technical Support'.",
    },
  ];

  const openModal = (item) => setModalContent(item);
  const closeModal = () => setModalContent(null);

  return (
    <main className="help-page">
      <h1 className="help-title">🛠 Need Help?</h1>
      <p className="help-subtitle">Explore the sections below or get direct support from the Modix team.</p>

      <div className="help-grid">
        {/* Documentation */}
        <div className="help-box">
          <h2>📖 Documentation</h2>
          <p>Step-by-step instructions, configuration help, and best practices for managing your server.</p>
          <a href="https://modix.app/docs" className="help-link" target="_blank" rel="noopener noreferrer">
            Open Documentation →
          </a>
        </div>

        {/* Support Tickets */}
        <div className="help-box">
          <h2>🎫 Support Tickets</h2>
          <p>Submit a support request and our team will help you resolve your issue quickly.</p>
          <a href="/help/open-ticket" className="help-link">Submit a Ticket →</a>
        </div>

        {/* FAQ */}
        <div className="help-box">
          <h2>❓ Frequently Asked Questions</h2>
          <ul className="faq-list">
            {faq.map((item, idx) => (
              <li key={idx} onClick={() => openModal(item)} className="faq-clickable">
                <strong>{item.question}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="support-note">
        🔧 Tip: If something breaks, always check the server logs — they usually tell you exactly what went wrong.
      </div>

      {/* FAQ Modal */}
      {modalContent && (
        <div className="faq-modal-overlay" onClick={closeModal}>
          <div className="faq-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modalContent.question}</h3>
            <p>{modalContent.answer}</p>
            <button className="close-modal" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Help;
