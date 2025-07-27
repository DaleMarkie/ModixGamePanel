"use client";

import React from "react";
import "./Team.css";

const teamMembers = [
  {
    name: "OV3RLORD",
    role: "Founder & Frontend Engineer",
    photo: "/team/overlord.jpg",
    bio: "Founder and creator of Modix. Designs, codes, and leads the entire vision of the panel. Frontend wizard.",
    socials: {
      github: "https://github.com/overlord",
      twitter: "https://twitter.com/overlord",
    },
  },
  {
    name: "GameSmithOnline",
    role: "Co-Founder & Backend Engineer",
    photo: "/team/gamesmith.jpg",
    bio: "Co-founder of Modix and master of the backend. Builds APIs, optimizes performance, and keeps the system running smoothly.",
    socials: {
      github: "https://github.com/gamesmithonline",
      linkedin: "https://linkedin.com/in/gamesmithonline",
    },
  },
];

function SocialLinks({ socials }) {
  return (
    <div className="social-links">
      {socials.github && (
        <a
          href={socials.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          🐙
        </a>
      )}
      {socials.twitter && (
        <a
          href={socials.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
        >
          🐦
        </a>
      )}
      {socials.linkedin && (
        <a
          href={socials.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          🔗
        </a>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <main className="team-page">
      <header>
        <h1>Meet the Team 👥</h1>
        <p>These are the awesome people building and maintaining your panel.</p>
      </header>

      <section className="team-list">
        {teamMembers.map(({ name, role, photo, bio, socials }) => (
          <article key={name} className="team-member-card">
            <img src={photo} alt={`${name} photo`} className="team-photo" />
            <h2>{name}</h2>
            <h3>{role}</h3>
            <p>{bio}</p>
            <SocialLinks socials={socials} />
          </article>
        ))}
      </section>

      <section className="donation-section">
        <h2>💖 Support Development</h2>
        <p>
          If you’d like to help us keep building and improving the Modix Game
          Panel, you can support us here:
        </p>
        <a
          href="https://ko-fi.com/modixgamepanel"
          target="_blank"
          rel="noopener noreferrer"
          className="donate-button"
        >
          ☕ Donate via Ko-fi
        </a>
      </section>
    </main>
  );
}
