"use client";
import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Star, AtSign, MessageSquare } from "lucide-react";
import "./StaffChat.css";

interface LocalUser {
  username: string;
  role?: "Owner" | "Admin" | "SubUser";
}

interface ChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  pinned?: boolean;
  important?: boolean;
  replies?: ChatMessage[];
  tags?: string[];
  reactions?: { [emoji: string]: string[] };
}

const LOCAL_CHAT_KEY = "modix_staff_chat";

const getLocalChat = (): ChatMessage[] => {
  const data = localStorage.getItem(LOCAL_CHAT_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalChat = (messages: ChatMessage[]) => {
  localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(messages));
};

export default function StaffChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiList = ["👍", "🔥", "❤️", "😂", "⚠️"];

  useEffect(() => {
    const user = localStorage.getItem("modix_user");
    if (user) {
      const parsed: LocalUser = JSON.parse(user);
      if (["Owner", "Admin"].includes(parsed.role || ""))
        setCurrentUser(parsed);
    }

    let storedMessages = getLocalChat();

    if (storedMessages.length === 0) {
      const welcome: ChatMessage = {
        id: Date.now().toString(),
        author: "System",
        message:
          "👋 Welcome to the Staff Chat! Coordinate with your team, share updates, or pin important info.",
        timestamp: new Date().toISOString(),
        pinned: true,
        important: true,
        replies: [],
        tags: [],
        reactions: {},
      };
      storedMessages = [welcome];
      saveLocalChat(storedMessages);
    }

    setMessages(storedMessages);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  if (!currentUser) {
    return (
      <div className="chat-container no-access">
        <MessageSquare size={40} />
        <p>Access restricted. Only staff members can use the chat.</p>
      </div>
    );
  }

  const extractTags = (text: string) => {
    const matches = text.match(/@(\w+)/g);
    return matches ? matches.map((m) => m.replace("@", "")) : [];
  };

  const sendMessage = (important = false) => {
    if (!message.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      author: currentUser.username,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      important,
      replies: [],
      tags: extractTags(message),
      reactions: {},
    };

    let updated = [...messages];
    if (replyTo) {
      updated = updated.map((m) =>
        m.id === replyTo ? { ...m, replies: [...(m.replies || []), newMsg] } : m
      );
    } else {
      updated.push(newMsg);
    }

    setMessages(updated);
    saveLocalChat(updated);
    setMessage("");
    setReplyTo(null);
  };

  const toggleReaction = (id: string, emoji: string) => {
    const updated = messages.map((m) => {
      if (m.id === id) {
        const reactions = { ...m.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];
        const hasReacted = reactions[emoji].includes(currentUser!.username);
        reactions[emoji] = hasReacted
          ? reactions[emoji].filter((u) => u !== currentUser!.username)
          : [...reactions[emoji], currentUser!.username];
        return { ...m, reactions };
      }
      return m;
    });
    setMessages(updated);
    saveLocalChat(updated);
  };

  const togglePin = (id: string) => {
    const updated = messages.map((m) =>
      m.id === id ? { ...m, pinned: !m.pinned } : m
    );
    setMessages(updated);
    saveLocalChat(updated);
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    saveLocalChat(updated);
  };

  const sorted = [...messages].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>💬 Staff Communication Hub</h2>
        <p>Collaborate, discuss, and manage server updates in real-time.</p>
      </header>

      <div className="chat-messages" ref={scrollRef}>
        {sorted.length === 0 ? (
          <p className="chat-empty">No messages yet.</p>
        ) : (
          sorted.map((msg) => (
            <div
              key={msg.id}
              className={`chat-msg ${msg.pinned ? "pinned" : ""} ${
                msg.important ? "important" : ""
              }`}
            >
              <div className="msg-header">
                <span className="msg-author">{msg.author}</span>
                <span className="msg-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.pinned && <span className="badge pinned">📌</span>}
                {msg.important && <span className="badge important">⚠️</span>}
              </div>

              <div className="msg-body">
                <p>
                  {msg.message}{" "}
                  {msg.tags?.map((tag) => (
                    <span key={tag} className="tag">
                      @{tag}
                    </span>
                  ))}
                </p>
              </div>

              <div className="msg-actions">
                <button onClick={() => togglePin(msg.id)} title="Pin message">
                  <Star size={16} />
                </button>
                <button onClick={() => deleteMessage(msg.id)} title="Delete">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setReplyTo(msg.id)} title="Reply">
                  <AtSign size={16} />
                </button>
              </div>

              <div className="msg-reactions">
                {emojiList.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(msg.id, emoji)}
                    title={msg.reactions?.[emoji]?.join(", ") || ""}
                  >
                    {emoji} {msg.reactions?.[emoji]?.length || ""}
                  </button>
                ))}
              </div>

              {msg.replies?.length > 0 && (
                <div className="msg-replies">
                  {msg.replies.map((r) => (
                    <div key={r.id} className="reply">
                      <strong>{r.author}:</strong> {r.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <footer className="chat-input">
        {replyTo && (
          <div className="replying-banner">
            Replying to{" "}
            <strong>{messages.find((m) => m.id === replyTo)?.author}</strong>
            <button onClick={() => setReplyTo(null)}>✖</button>
          </div>
        )}
        <div className="input-row">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message... use @user to tag"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="send-btn" onClick={() => sendMessage()}>
            <Plus size={18} />
          </button>
          {currentUser.role === "Owner" && (
            <button
              className="important-btn"
              onClick={() => sendMessage(true)}
              title="Send important message"
            >
              ⚠️
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
