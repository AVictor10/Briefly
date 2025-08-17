import React from 'react';
import { useState } from "react";
import { shareSummary } from "../services/api";  // your axios wrapper

function SummaryEditor({ initialSummary }) {
  const [summary, setSummary] = useState(initialSummary || "");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("Meeting Summary");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSend = async () => {
    if (!recipients.trim()) {
      setMessage("Please enter at least one recipient.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await shareSummary({
        summary,
        recipients,
        subject,
      });

      setMessage(response.message || "Summary sent successfully!");
      setRecipients(""); // clear field after send
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Failed to send summary. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-container">
      <h2>Edit Summary Before Sending</h2>
      
      {/* Editable summary */}
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={10}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      {/* Subject */}
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Email subject"
        style={{ width: "100%", marginBottom: "10px" }}
      />

      {/* Recipients */}
      <textarea
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
        rows={3}
        placeholder="Enter recipient emails (one per line)"
        style={{ width: "100%", marginBottom: "10px" }}
      />

      {/* Send button */}
      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send Email"}
      </button>

      {/* Status message */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default SummaryEditor;
