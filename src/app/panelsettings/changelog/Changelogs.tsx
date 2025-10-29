"use client";

import React, { useState, useEffect } from "react";
import "./Changelogs.css";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  timeAgo: string;
  url: string;
  tags: string[];
  fullMessage: string;
}

interface Issue {
  id: number;
  title: string;
  user: string;
  state: string;
  created_at: string;
  timeAgo: string;
  url: string;
  body: string;
  labels: string[];
}

export default function Changelogs() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"commits" | "issues">("commits");
  const [loading, setLoading] = useState(false);

  // Helper to get "time ago" format
  const timeSince = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    return "just now";
  };

  // Fetch commits
  const fetchCommits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        "https://api.github.com/repos/DaleMarkie/ModixGamePanel/commits?per_page=20"
      );
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();

      const formatted = data.map((c: any) => {
        const tagMatches = c.commit.message.match(/\[(.*?)\]/g);
        const tags = tagMatches
          ? tagMatches.map((t: string) => t.replace(/\[|\]/g, ""))
          : [];
        const authorName =
          c.commit.author?.name || c.author?.login || "Unknown Developer";
        const commitDate = c.commit.author?.date || c.commit.committer?.date;

        return {
          sha: c.sha,
          message: c.commit.message.split("\n")[0],
          fullMessage: c.commit.message,
          author: authorName,
          date: commitDate
            ? new Date(commitDate).toLocaleString()
            : "Unknown date",
          timeAgo: commitDate ? timeSince(commitDate) : "Unknown",
          url: c.html_url,
          tags,
        };
      });
      setCommits(formatted);
    } catch (err: any) {
      console.error("Commit fetch failed:", err);
      setError(
        "Could not fetch commits. Try again later or check rate limits."
      );
      setCommits([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch issues
  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        "https://api.github.com/repos/DaleMarkie/ModixGamePanel/issues?state=all&per_page=20"
      );
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();

      const formatted = data.map((i: any) => ({
        id: i.id,
        title: i.title,
        user: i.user?.login || "Unknown User",
        state: i.state,
        created_at: i.created_at,
        timeAgo: timeSince(i.created_at),
        url: i.html_url,
        body: i.body || "",
        labels: i.labels?.map((l: any) => l.name) || [],
      }));
      setIssues(formatted);
    } catch (err: any) {
      console.error("Issue fetch failed:", err);
      setError("Could not fetch issues. Try again later or check rate limits.");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "commits") fetchCommits();
    else fetchIssues();
  }, [view]);

  return (
    <div className="updater-container">
      <header className="updater-header">
        <h1>Modix Game Panel Updater</h1>
        <p className="short-description">
          Tracking live updates and reports from <strong>Overlord</strong> and{" "}
          <strong>GameSmithOnline</strong> via GitHub.
          <br />
          <a
            href="https://github.com/DaleMarkie/ModixGamePanel"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/DaleMarkie/ModixGamePanel
          </a>
        </p>

        <div className="view-toggle">
          <button
            onClick={() => setView("commits")}
            className={view === "commits" ? "active" : ""}
          >
            Commits
          </button>
          <button
            onClick={() => setView("issues")}
            className={view === "issues" ? "active" : ""}
          >
            Issues
          </button>
        </div>
      </header>

      <section className="changelog-section">
        <h2>
          {view === "commits" ? "Latest Commits" : "Open & Closed Issues"}
        </h2>
        {loading && <p>Loading {view}...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="changelog-list">
          {view === "commits" && commits.length === 0 && !error && (
            <p>No commits found...</p>
          )}
          {view === "issues" && issues.length === 0 && !error && (
            <p>No issues found...</p>
          )}

          {view === "commits" &&
            commits.map((c, idx) => (
              <div key={c.sha} className="changelog-entry">
                <div className="changelog-header">
                  <span className="commit-index">#{idx + 1}</span>
                  {c.tags.map((tag, i) => (
                    <span key={i} className="badge-tag">
                      {tag}
                    </span>
                  ))}
                  <span className="changelog-date">
                    {c.timeAgo} ({c.date})
                  </span>
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

          {view === "issues" &&
            issues.map((i, idx) => (
              <div key={i.id} className="changelog-entry">
                <div className="changelog-header">
                  <span className="commit-index">#{idx + 1}</span>
                  {i.labels.map((label, j) => (
                    <span key={j} className="badge-tag">
                      {label}
                    </span>
                  ))}
                  <span className={`issue-state ${i.state}`}>{i.state}</span>
                  <span className="changelog-date">{i.timeAgo}</span>
                </div>
                <div className="commit-details">
                  <p>
                    <strong>Title:</strong> {i.title}
                  </p>
                  <p>
                    <strong>Author:</strong> {i.user}
                  </p>
                  <pre className="commit-full-message">{i.body}</pre>
                  <a href={i.url} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </div>
              </div>
            ))}
        </div>
      </section>

      <footer className="updater-footer">
        <p>
          <strong>v1.2 Notice:</strong> Commits and issues are now live-tracked
          directly from GitHub. Expect real-time updates and integrated reports.
        </p>
      </footer>
    </div>
  );
}
