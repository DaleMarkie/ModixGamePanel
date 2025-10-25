"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Star, AtSign } from "lucide-react";
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
  reactions?: { [emoji: string]: string[] }; // emoji -> list of usernames
}

const LOCAL_CHAT_KEY = "modix_staff_chat";

const getLocalChat = (): ChatMessage[] => {
  const data = localStorage.getItem(LOCAL_CHAT_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalChat = (messages: ChatMessage[]) => {
  localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(messages));
};

const StaffChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const emojiList = ["👍", "👎", "❤️", "😂", "⚠️"];

  useEffect(() => {
    const user = localStorage.getItem("modix_user");
    if (user) {
      const parsed: LocalUser = JSON.parse(user);
      if (["Owner", "Admin"].includes(parsed.role || ""))
        setCurrentUser(parsed);
    }

    let storedMessages = getLocalChat();

    // Add example message if none exists
    if (storedMessages.length === 0) {
      const exampleMessage: ChatMessage = {
        id: Date.now().toString(),
        author: "System",
        message:
          "Welcome to the Staff Chat! Here you can coordinate tasks, ask questions, or pin important messages for your team. Keep Updated.",
        timestamp: new Date().toISOString(),
        pinned: true,
        important: true,
        replies: [],
        tags: [],
        reactions: {},
      };
      storedMessages = [exampleMessage];
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

  if (!currentUser)
    return (
      <div className="chat-container">
        <p className="chat-warning">
          Only staff and owners can access this chat.
        </p>
      </div>
    );

  const extractTags = (text: string) => {
    const matches = text.match(/@(\w+)/g);
    return matches ? matches.map((m) => m.replace("@", "")) : [];
  };

  const sendMessage = (important = false) => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      author: currentUser.username,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      pinned: false,
      important,
      replies: [],
      tags: extractTags(message),
      reactions: {},
    };

    if (replyTo) {
      const updated = messages.map((m) =>
        m.id === replyTo
          ? { ...m, replies: [...(m.replies || []), newMessage] }
          : m
      );
      setMessages(updated);
      saveLocalChat(updated);
    } else {
      const updated = [...messages, newMessage];
      setMessages(updated);
      saveLocalChat(updated);
    }

    setMessage("");
    setReplyTo(null);
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    const updated = messages.map((m) => {
      if (m.id === msgId) {
        const reactions = { ...m.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];

        if (reactions[emoji].includes(currentUser!.username)) {
          reactions[emoji] = reactions[emoji].filter(
            (u) => u !== currentUser!.username
          );
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji].push(currentUser!.username);
        }
        return { ...m, reactions };
      }
      return m;
    });
    setMessages(updated);
    saveLocalChat(updated);
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
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

  const toggleImportant = (id: string) => {
    const updated = messages.map((m) =>
      m.id === id ? { ...m, important: !m.important } : m
    );
    setMessages(updated);
    saveLocalChat(updated);
  };

  const sortedMessages = [...messages].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="chat-container">
      <h1 className="chat-title">Owner & Staff Chat</h1>
      <p className="chat-help">
        This chat helps staff coordinate, share updates, ask questions, and pin
        important messages for easy reference.
      </p>

      {/* Input */}
      <div className="chat-input">
        {replyTo && (
          <div className="chat-replying">
            Replying to:{" "}
            <strong>{messages.find((m) => m.id === replyTo)?.author}</strong>
            <button onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}
        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Type a message... (@username to tag)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={() => sendMessage(false)} title="Send Message">
            <Plus size={18} />
          </button>
          {currentUser.role === "Owner" && (
            <button
              onClick={() => sendMessage(true)}
              className="important-btn"
              title="Send Important Message"
            >
              !
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={scrollRef}>
        {sortedMessages.length === 0 ? (
          <p className="chat-empty">No messages yet.</p>
        ) : (
          sortedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.pinned ? "pinned" : ""} ${
                msg.important ? "important" : ""
              }`}
            >
              <div className="chat-message-header">
                <div className="chat-author-time">
                  <span className="chat-author">{msg.author}</span>
                  <span className="chat-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.pinned && (
                    <span className="badge pinned-badge">PINNED</span>
                  )}
                  {msg.important && (
                    <span className="badge important-badge">IMPORTANT</span>
                  )}
                </div>

                <div className="chat-controls">
                  <button onClick={() => togglePin(msg.id)} title="Pin/Unpin">
                    <Star size={16} className={msg.pinned ? "active" : ""} />
                  </button>
                  <button
                    onClick={() => toggleImportant(msg.id)}
                    title="Mark Important"
                  >
                    !
                  </button>
                  <button onClick={() => deleteMessage(msg.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setReplyTo(msg.id)} title="Reply">
                    <AtSign size={16} />
                  </button>
                </div>
              </div>

              <p className="chat-message-text">
                {msg.message}{" "}
                {msg.tags?.map((tag) => (
                  <span key={tag} className="chat-tag">
                    @{tag}
                  </span>
                ))}
              </p>

              {/* Reactions */}
              <div className="chat-reactions">
                {emojiList.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(msg.id, emoji)}
                    title={msg.reactions?.[emoji]?.join(", ") || ""}
                  >
                    {emoji} {msg.reactions?.[emoji]?.length || 0}
                  </button>
                ))}
              </div>

              {msg.replies &&
                msg.replies.map((reply) => (
                  <div key={reply.id} className="chat-reply">
                    <span className="chat-author">{reply.author}</span>:
                    <span className="chat-message-text">{reply.message}</span>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffChat;
