import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Fqa.css";

const faqs = [
  {
    category: "Dashboard",
    question: "How do I enable the Theme Manager module?",
    answer: `Navigate to your Dashboard, scroll to Core Modules, and click on "Theme Manager".`,
    code: `// In Dashboard2.js
if (moduleName === "Theme Manager") {
  navigate("/thememanager");
}`,
  },
  {
    category: "Games",
    game: "Project Zomboid",
    question: "How do I enable mod logging for Project Zomboid?",
    answer: "Edit `servertest.ini` and set `LogLocalChat=true`.",
  },
  {
    category: "Games",
    game: "Rust",
    question: "How do I add plugins in Rust?",
    answer: "Use the Oxide mod framework and upload .cs files into the `oxide/plugins` folder.",
  },
  {
    category: "Games",
    game: "DayZ",
    question: "How do I install DayZ server mods?",
    answer: "Place the mod folder into the server directory and add it to the `-mod=` launch string.",
  },
  {
    category: "Settings",
    question: "How do I use useState in React?",
    answer: "Import it from React and initialize your state:",
    code: `import { useState } from 'react';
const [value, setValue] = useState("");`,
  },
];

const categories = [
  "All",
  "Dashboard",
  "Terminal",
  "File Manager",
  "Mod Manager",
  "Player Manager",
  "Settings",
  "Games",
];

const gameOptions = ["All Games", "Project Zomboid", "DayZ", "Rust"];

const FAQ = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGame, setSelectedGame] = useState("All Games");
  const [gameSearchTerm, setGameSearchTerm] = useState("");

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const isGamesMode = selectedCategory === "Games";

  const filteredFaqs = faqs.filter((item) => {
    const matchCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase());

    const matchGame =
      !isGamesMode ||
      selectedGame === "All Games" ||
      item.game === selectedGame;

    const matchGameSearch =
      !isGamesMode ||
      item.question.toLowerCase().includes(gameSearchTerm.toLowerCase());

    return matchCategory && matchSearch && matchGame && matchGameSearch;
  });

  return (
    <div className="modix-dashboard-container">
      <div className="top-bar">
        <h1>📘 Modix FAQ – Developer Help</h1>
        <div className="button-group">
          <button onClick={() => navigate("/")}>← Back to Dashboard</button>
        </div>
      </div>

      <div className="faq-controls">
        <div className="faq-search-bar">
          <input
            type="text"
            placeholder="Search all FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="faq-category-buttons">
          {categories.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? "active" : ""}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedGame("All Games");
                setGameSearchTerm("");
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {isGamesMode && (
          <div className="game-submenu">
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search Game FAQ..."
              value={gameSearchTerm}
              onChange={(e) => setGameSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="faq-container">
        {filteredFaqs.length === 0 ? (
          <p style={{ color: "#bbb", padding: "20px" }}>No FAQs found.</p>
        ) : (
          filteredFaqs.map((item, index) => (
            <div
              key={index}
              className={`faq-card ${activeIndex === index ? "active" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h3>{item.question}</h3>
                <span>{activeIndex === index ? "▲" : "▼"}</span>
              </div>
              {activeIndex === index && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                  {item.code && (
                    <pre>
                      <code>{item.code}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FAQ;
