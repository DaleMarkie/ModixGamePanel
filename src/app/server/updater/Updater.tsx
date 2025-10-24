"use client";

import React, { useState, useEffect } from "react";
import "./Updater.css";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
  tags: string[];
  fullMessage: string;
}

export default function Updater() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCommits = async () => {
    try {
      setError(null);
      const res = await fetch(
        "https://api.github.com/repos/DaleMarkie/ModixGamePanel/commits?per_page=20"
      );

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const data = await res.json();

      const formatted = data.map((c: any) => {
        const tagMatches = c.commit.message.match(/\[(.*?)\]/g);
        const tags = tagMatches
          ? tagMatches.map((t: string) => t.replace(/\[|\]/g, ""))
          : [];

        return {
          sha: c.sha,
          message: c.commit.message.split("\n")[0],
          fullMessage: c.commit.message,
          author: c.commit.author?.name || "Unknown",
          date: c.commit.author?.date
            ? new Date(c.commit.author.date).toLocaleString()
            : "Unknown",
          url: c.html_url,
          tags,
        };
      });

      setCommits(formatted);
    } catch (err: any) {
      console.error("Failed to fetch commits:", err);
      setError(
        "Could not fetch commits. Try again later or check rate limits."
      );
      setCommits([]);
    }
  };

  useEffect(() => {
    fetchCommits();
    const interval = setInterval(fetchCommits, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="updater-container">
      <header className="updater-header">
        <h1>Modix Game Panel Updater</h1>
        <p className="short-description">
          Live updates from the official Modix GitHub:{" "}
          <a
            href="https://github.com/DaleMarkie/ModixGamePanel"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/DaleMarkie/ModixGamePanel
          </a>
        </p>
      </header>

      <section className="changelog-section">
        <h2>Latest Commits</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="changelog-list">
          {commits.length === 0 && !error && <p>No commits found...</p>}
          {commits.map((c, idx) => (
            <div key={c.sha} className="changelog-entry">
              <div className="changelog-header">
                <span className="commit-index">#{idx + 1}</span>
                {c.tags.map((tag, i) => (
                  <span key={i} className="badge-tag">
                    {tag}
                  </span>
                ))}
                <span className="changelog-date">{c.date}</span>
              </div>
              <div className="commit-details">
                <p>
                  <strong>Message:</strong> {c.message}
                </p>
                <p>
                  <strong>Author:</strong> {c.author}
                </p>
                <p>
                  <strong>SHA:</strong> {c.sha}
                </p>
                <pre className="commit-full-message">{c.fullMessage}</pre>
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
