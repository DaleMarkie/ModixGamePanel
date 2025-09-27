"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";

interface ForumPost {
  id: string;
  author: string;
  title: string;
  content: string;
  category: "Modix Issue" | "Game Issue";
  status: "solved" | "unsolved";
  timestamp: string;
  comments: ForumComment[];
}

interface ForumComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

const Forums: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"Modix Issue" | "Game Issue">(
    "Modix Issue"
  );
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  const [filterStatus, setFilterStatus] = useState<
    "recent" | "solved" | "unsolved"
  >("recent");

  const API_BASE = "http://localhost:2010/api/forums";

  // --- User detection ---
  const user = useMemo(() => {
    const stored = localStorage.getItem("modix_user");
    return stored ? JSON.parse(stored) : null;
  }, []);

  // --- EARLY RETURN for not logged-in users ---
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 px-4">
        <div className="bg-zinc-800 border border-green-600 rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4 animate-pulse">⚠️</div>
          <h2 className="text-3xl font-bold text-green-400 mb-4">
            Access Restricted
          </h2>
          <p className="text-green-300 mb-4 text-lg">
            You must be{" "}
            <span className="text-green-400 font-semibold">logged in</span> to
            view the forums.
          </p>
          <p className="text-green-400 mb-6 text-base">
            Please contact your{" "}
            <span className="font-semibold">administrator</span> or log in to
            gain access.
          </p>
          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="px-6 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // --- Fetch posts ---
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("modix_token")}`,
        },
      });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // --- Create new post ---
  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim())
      return alert("Fill in title and content.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("modix_token")}`,
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          author: user.username,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        setNewCategory("Modix Issue");
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Create comment ---
  const createComment = async (postId: string) => {
    const content = newComments[postId];
    if (!content?.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("modix_token")}`,
        },
        body: JSON.stringify({
          content,
          author: user.username,
        }),
      });
      if (res.ok) {
        setNewComments({ ...newComments, [postId]: "" });
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Filter posts ---
  const filteredPosts = posts
    .filter((p) => {
      if (filterStatus === "solved") return p.status === "solved";
      if (filterStatus === "unsolved") return p.status === "unsolved";
      return true;
    })
    .filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase())
    )
    .slice()
    .reverse(); // Recent first

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-400 flex items-center gap-2">
        Forums
      </h1>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-900 border border-green-600 rounded-lg px-3 py-2 shadow-inner w-full md:w-1/2">
          <Search className="w-5 h-5 text-green-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-green-300 placeholder-green-500 w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded-lg ${
              filterStatus === "recent"
                ? "bg-green-700"
                : "bg-zinc-800 text-green-300"
            }`}
            onClick={() => setFilterStatus("recent")}
          >
            Recent
          </button>
          <button
            className={`px-3 py-1 rounded-lg ${
              filterStatus === "unsolved"
                ? "bg-green-700"
                : "bg-zinc-800 text-green-300"
            }`}
            onClick={() => setFilterStatus("unsolved")}
          >
            Unsolved
          </button>
          <button
            className={`px-3 py-1 rounded-lg ${
              filterStatus === "solved"
                ? "bg-green-700"
                : "bg-zinc-800 text-green-300"
            }`}
            onClick={() => setFilterStatus("solved")}
          >
            Solved
          </button>
        </div>
      </div>

      {/* New Post Form */}
      <div className="bg-zinc-900 border border-green-600 rounded-xl p-4 shadow-lg flex flex-col gap-4">
        <input
          type="text"
          placeholder="Post Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="bg-zinc-800 border border-green-700 rounded-lg px-3 py-2 text-green-300 w-full"
        />
        <textarea
          placeholder="Your question or content..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="bg-zinc-800 border border-green-700 rounded-lg px-3 py-2 text-green-300 w-full h-32 resize-none"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as any)}
          className="bg-zinc-800 border border-green-700 rounded-lg px-3 py-2 text-green-300 w-full"
        >
          <option value="Modix Issue">Modix Issue</option>
          <option value="Game Issue">Game Issue</option>
        </select>
        <button
          onClick={createPost}
          disabled={loading}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Post
        </button>
      </div>

      {/* Posts List */}
      <div className="bg-zinc-900 border border-green-600 rounded-xl p-4 max-h-[600px] overflow-y-auto shadow-lg space-y-4">
        {filteredPosts.length === 0 ? (
          <p className="text-green-400 text-center mt-10 text-lg">
            Module not active for v1.1.2
          </p>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-zinc-800 border border-green-700 rounded-2xl shadow-md p-4 flex flex-col gap-2 hover:bg-zinc-700 transition-all duration-200"
            >
              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-green-300">
                  {post.title}
                </p>
                <span className="text-xs px-2 py-1 rounded-lg bg-zinc-900 border border-green-600 text-green-400">
                  {post.category} | {post.status}
                </span>
              </div>
              <p className="text-sm text-green-200">{post.content}</p>
              <p className="text-xs text-green-500">
                Posted by {post.author} on{" "}
                {new Date(post.timestamp).toLocaleString()}
              </p>

              {/* Comments */}
              <div className="pl-4 border-l border-green-700 space-y-2 mt-2">
                {post.comments.map((c) => (
                  <div key={c.id} className="text-sm text-green-200">
                    <strong>{c.author}:</strong> {c.content}{" "}
                    <span className="text-xs text-green-500">
                      ({new Date(c.timestamp).toLocaleString()})
                    </span>
                  </div>
                ))}
              </div>

              {/* New comment input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComments[post.id] || ""}
                  onChange={(e) =>
                    setNewComments({
                      ...newComments,
                      [post.id]: e.target.value,
                    })
                  }
                  className="bg-zinc-800 border border-green-700 rounded-lg px-3 py-2 text-green-300 flex-1"
                />
                <button
                  onClick={() => createComment(post.id)}
                  disabled={loading}
                  className="px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-all duration-200"
                >
                  Comment
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Forums;
