"use client";
import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import "./terminal.css";

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter: (command?: string) => void;
  disabled?: boolean;
  savedCommands: string[];
}

export default function CommandInput({
  value,
  onChange,
  onEnter,
  disabled = false,
  savedCommands,
}: CommandInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!value.trim()) {
      setFiltered([]);
      setShowDropdown(false);
      return;
    }
    const matches = savedCommands.filter((cmd) =>
      cmd.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(matches);
    setShowDropdown(matches.length > 0);
    setActiveIndex(0);
  }, [value, savedCommands]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (showDropdown && filtered[activeIndex]) {
        onEnter(filtered[activeIndex]);
      } else {
        onEnter();
      }
      setShowDropdown(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showDropdown && filtered.length > 0)
        setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showDropdown && filtered.length > 0)
        setActiveIndex(
          (prev) => (prev - 1 + filtered.length) % filtered.length
        );
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleClickSuggestion = (cmd: string, e: React.MouseEvent) => {
    e.preventDefault();
    onChange(cmd);
    onEnter(cmd);
    setShowDropdown(false);
  };

  return (
    <div className="terminal-input-wrapper">
      <div className="terminal-input-bar">
        <span className="prompt">$</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type server command..."
          autoComplete="off"
        />
        <span className="cursor" />
      </div>
      {showDropdown && filtered.length > 0 && (
        <ul className="autocomplete-dropdown">
          {filtered.map((cmd, idx) => (
            <li
              key={cmd}
              className={idx === activeIndex ? "active" : ""}
              onMouseDown={(e) => handleClickSuggestion(cmd, e)}
            >
              {cmd}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
