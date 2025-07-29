import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Support.css";

const CreateTicket = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("General");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert("Please fill all fields.");
      return;
    }

    // Replace with API call later
    console.log("Ticket Submitted:", { subject, message, category });

    alert("✅ Support ticket submitted.");
    navigate("/support");
  };

  return (
    <div className="boxed-support-container">
      <div className="support-header">
        <h1>📩 Open Support Ticket</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="support-box">
        <p className="ticket-info-text">
          If you're experiencing issues or need assistance, please submit a ticket using the form below.
          <br />
          <strong>Note:</strong> Support typically responds within <strong>1–2 working days</strong>. Thank you for your patience.
        </p>

        <form className="support-form" onSubmit={handleSubmit}>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="General">General</option>
            <option value="Technical">Technical</option>
            <option value="Licensing">Licensing</option>
            <option value="Other">Other</option>
          </select>

          <label>Subject</label>
          <input
            type="text"
            placeholder="e.g., Server won't start"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <label>Message</label>
          <textarea
            rows="6"
            placeholder="Describe your issue in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit" className="submit-btn">Submit Ticket</button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
