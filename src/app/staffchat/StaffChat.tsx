"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Star,
  MessageSquare,
  CornerDownRight,
} from "lucide-react";
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
  reactions?: Record<string, string[]>;
  webhook?: boolean;
}

const LOCAL_CHAT_KEY = "modix_staff_chat";

const getLocalChat = (): ChatMessage[] =>
  JSON.parse(localStorage.getItem(LOCAL_CHAT_KEY) || "[]");

const saveLocalChat = (messages: ChatMessage[]) =>
  localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(messages));

export default function StaffChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [showWarning, setShowWarning] = useState(true);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookURL, setWebhookURL] = useState(
    localStorage.getItem("modix_webhook_url") || ""
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiList = ["👍", "🔥", "❤️", "😂", "⚠️"];

  // Load user & initial messages
  useEffect(() => {
    const user = localStorage.getItem("modix_user");
    if (user) {
      const parsed: LocalUser = JSON.parse(user);
      if (["Owner", "Admin"].includes(parsed.role || ""))
        setCurrentUser(parsed);
    }

    let stored = getLocalChat();
    if (!stored.length) {
      const welcome: ChatMessage = {
        id: Date.now().toString(),
        author: "System",
        message:
          "👋 Welcome to the Staff Chat! Use @user to tag and reply to threads.",
        timestamp: new Date().toISOString(),
        pinned: true,
        important: true,
        replies: [],
        tags: [],
        reactions: {},
      };
      stored = [welcome];
      saveLocalChat(stored);
    }
    setMessages(stored);
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

  const extractTags = (text: string) =>
    [...text.matchAll(/@(\w+)/g)].map((m) => m[1]);

  const updateMessages = (updater: (msgs: ChatMessage[]) => ChatMessage[]) => {
    const updated = updater(messages);
    setMessages(updated);
    saveLocalChat(updated);
  };

  const sendMessage = (important = false) => {
    if (!message.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      author: currentUser!.username,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      important,
      replies: [],
      tags: extractTags(message),
      reactions: {},
      webhook: webhookEnabled,
    };

    if (replyTo) {
      updateMessages((msgs) =>
        msgs.map((m) =>
          m.id === replyTo.id
            ? { ...m, replies: [...(m.replies || []), newMsg] }
            : {
                ...m,
                replies: m.replies ? updateMessagesRecursive(m.replies) : [],
              }
        )
      );
    } else {
      updateMessages((msgs) => [...msgs, newMsg]);
    }

    // Webhook for sending messages
    if (webhookEnabled && webhookURL) {
      fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser!.username,
          embeds: [
            {
              title: "Staff Chat Message",
              description: replyTo
                ? `Replying to **${replyTo.author}**: ${
                    replyTo.message
                  }\n\n${message.trim()}`
                : message.trim(),
              color: 3447003,
              timestamp: new Date().toISOString(),
              footer: { text: "Modix Staff Chat" },
            },
          ],
        }),
      }).catch((err) => console.error("Webhook failed:", err));
    }

    setMessage("");
    setReplyTo(null);

    function updateMessagesRecursive(msgs: ChatMessage[]): ChatMessage[] {
      return msgs.map((m) => ({
        ...m,
        replies: m.replies ? updateMessagesRecursive(m.replies) : [],
      }));
    }
  };

  const toggleReaction = (id: string, emoji: string) => {
    const reactedUser = currentUser!.username;

    updateMessages((msgs) =>
      msgs.map((m) => {
        if (m.id === id) {
          const reactions = { ...m.reactions };
          const users = reactions[emoji] || [];
          const hasReacted = users.includes(reactedUser);
          reactions[emoji] = hasReacted
            ? users.filter((u) => u !== reactedUser)
            : [...users, reactedUser];

          // Send webhook on reaction
          if (webhookEnabled && webhookURL) {
            fetch(webhookURL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: reactedUser,
                embeds: [
                  {
                    title: "Staff Chat Reaction",
                    description: `${reactedUser} reacted with ${emoji} to ${m.author}'s message: "${m.message}"`,
                    color: 16776960, // yellow
                    timestamp: new Date().toISOString(),
                    footer: { text: "Modix Staff Chat" },
                  },
                ],
              }),
            }).catch((err) => console.error("Webhook failed:", err));
          }

          return { ...m, reactions };
        }
        return {
          ...m,
          replies: m.replies ? m.replies.map(toggleReactionRecursive) : [],
        };
      })
    );

    function toggleReactionRecursive(msg: ChatMessage): ChatMessage {
      return {
        ...msg,
        replies: msg.replies ? msg.replies.map(toggleReactionRecursive) : [],
      };
    }
  };

  const togglePin = (id: string) =>
    updateMessages((msgs) =>
      msgs.map((m) =>
        m.id === id
          ? { ...m, pinned: !m.pinned }
          : {
              ...m,
              replies: m.replies ? m.replies.map(togglePinRecursive) : [],
            }
      )
    );

  function togglePinRecursive(msg: ChatMessage): ChatMessage {
    return {
      ...msg,
      replies: msg.replies ? msg.replies.map(togglePinRecursive) : [],
    };
  }

  const deleteMessage = (id: string) =>
    updateMessages((msgs) =>
      msgs
        .filter((m) => m.id !== id)
        .map((m) => ({
          ...m,
          replies: m.replies ? deleteRecursive(m.replies) : [],
        }))
    );

  function deleteRecursive(msgs: ChatMessage[]): ChatMessage[] {
    return msgs
      .filter((m) => m.id !== id)
      .map((m) => ({
        ...m,
        replies: m.replies ? deleteRecursive(m.replies) : [],
      }));
  }

  const toggleThread = (id: string) =>
    setExpandedThreads((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const renderMessages = (msgs: ChatMessage[], depth = 0) =>
    msgs.map((msg) => (
      <div
        key={msg.id}
        className={`chat-msg ${msg.pinned ? "pinned" : ""} ${
          msg.important ? "important" : ""
        } ${msg.webhook ? "webhook" : ""}`}
        style={{ marginLeft: depth * 20 }}
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

        {msg.replies?.length && depth === 0 && (
          <div className="replying-banner">
            {msg.replies.length}{" "}
            {msg.replies.length === 1 ? "reply" : "replies"}
          </div>
        )}

        <div className="msg-body">
          {replyTo && replyTo.id === msg.id && (
            <div className="replying-banner">
              Replying to <strong>{replyTo.author}</strong>:{" "}
              <span className="reply-preview">
                {replyTo.message.slice(0, 50)}...
              </span>
            </div>
          )}
          <p>
            {msg.message}
            {msg.tags?.map((tag) => (
              <span key={tag} className="tag">
                @{tag}
              </span>
            ))}
          </p>
        </div>

        {msg.webhook && (
          <div className="webhook-footer">Embedded via Webhook 🌐</div>
        )}

        <div className="msg-actions">
          <button onClick={() => togglePin(msg.id)} title="Pin">
            <Star size={16} />
          </button>
          <button onClick={() => deleteMessage(msg.id)} title="Delete">
            <Trash2 size={16} />
          </button>
          <button onClick={() => setReplyTo(msg)} title="Reply">
            <CornerDownRight size={16} />
          </button>
          {msg.replies?.length ? (
            <button
              onClick={() => toggleThread(msg.id)}
              className="thread-btn"
              title="View replies"
            >
              💬 {msg.replies.length}
            </button>
          ) : null}
        </div>

        <div className="msg-reactions">
          {emojiList.map((emoji) => (
            <button
              key={emoji}
              className="emoji-btn"
              onClick={() => toggleReaction(msg.id, emoji)}
              title={msg.reactions?.[emoji]?.join(", ") || ""}
            >
              {emoji}{" "}
              <span className="emoji-count">
                {msg.reactions?.[emoji]?.length || ""}
              </span>
            </button>
          ))}
        </div>

        {expandedThreads.includes(msg.id) &&
          msg.replies?.length &&
          renderMessages(msg.replies, depth + 1)}
      </div>
    ));

  const sorted = [...messages].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>💬 Staff Communication Hub</h2>
        <p>Discuss, coordinate, and track your team's workflow efficiently.</p>
      </header>

      {/* WARNING POPUP */}
      {showWarning && (
        <div className="chat-warning">
          ⚠️ Do NOT share passwords, personal info, or sensitive data.
          <button onClick={() => setShowWarning(false)}>✖</button>
        </div>
      )}

      <div className="chat-messages" ref={scrollRef}>
        {sorted.length === 0 ? (
          <p className="chat-empty">No messages yet.</p>
        ) : (
          renderMessages(sorted)
        )}
      </div>

      {/* Webhook input */}
      {webhookEnabled && (
        <div className="webhook-url-input">
          <input
            type="text"
            placeholder="Enter Webhook URL"
            value={webhookURL}
            onChange={(e) => setWebhookURL(e.target.value)}
          />
          <button
            onClick={() =>
              localStorage.setItem("modix_webhook_url", webhookURL)
            }
          >
            Save
          </button>
        </div>
      )}

      <footer className="chat-input">
        {replyTo && (
          <div className="replying-banner">
            Replying to <strong>{replyTo.author}</strong>:{" "}
            <span className="reply-preview">
              {replyTo.message.slice(0, 50)}...
            </span>
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
          <button
            className="webhook-btn"
            onClick={() => setWebhookEnabled(!webhookEnabled)}
          >
            🌐 Webhooks {webhookEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </footer>
    </div>
  );
}
