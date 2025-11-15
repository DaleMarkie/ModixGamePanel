"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronRight, FaBars, FaSearch, FaTimes } from "react-icons/fa";
import { navLinks } from "./navConfig";
import SidebarUserInfo from "./SidebarUserInfo";
import "./DashboardLayout.css";

const USER_KEY = "modix_user";
const THEME_KEY = "modix_dashboard_theme";

const displayTags = [
  { key: "Getting Started", label: "📘 Getting Started" },
  { key: "Frontend Issue", label: "🛠 Frontend Issue" },
  { key: "Backend Issue", label: "🖥 Backend Issue" },
  { key: "Game Server Issue", label: "⚠️ Game Server Issue" },
  { key: "Reported Bugs", label: "⚠️ Reported Bugs" },
];

const mockErrorDatabase = [
  {
    code: "What Is Modix Game Panel?",
    desc: "Modix Game Panel is a long-term project by DaleMarkie (aka OV3RLORD)...",
    tags: ["Getting Started", "Modix"],
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [errorSearch, setErrorSearch] = useState("");
  const [selectedError, setSelectedError] = useState(null);
  const [activeTag, setActiveTag] = useState("");
  const [theme, setTheme] = useState({
    background: "", gradient: "", logo: "https://i.ibb.co/cMPwcn8/logo.png", title: "Modix Game Panel", icons: {}
  });
  const [currentUserState, setCurrentUserState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });

  const allTags = useMemo(() => displayTags.map(t => t.key), []);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) try { const parsed = JSON.parse(saved); setTheme(parsed); applyTheme(parsed); } catch {}
    const handle = e => e.detail && (setTheme(e.detail), applyTheme(e.detail));
    window.addEventListener("themeUpdate", handle);
    return () => window.removeEventListener("themeUpdate", handle);
  }, []);

  const applyTheme = t => {
    const body = document.body;
    body.style.background = t.gradient || (t.background ? `url(${t.background}) no-repeat center/cover` : "");
  };

  const allowedPages = currentUserState?.role === "Owner" ? null : currentUserState?.pages || [];
  const toggleSubMenu = href => setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));

  const filteredNavLinks = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    const filterLinks = links => links.map(({ label, href = "", submenu }) => {
      if (!currentUserState && label.toLowerCase() !== "support") return null;
      const matches = !searchTerm || label.toLowerCase().includes(lower) || (href && href.toLowerCase().includes(lower));
      const allowed = !allowedPages || allowedPages.includes(label) || (href && allowedPages.includes(href.replace(/^\//, ""))) || (href && allowedPages.includes(href));
      const sub = submenu ? filterLinks(submenu) : null;
      return (matches && allowed) || (sub && sub.length) ? { label, href, submenu: sub } : null;
    }).filter(Boolean);
    return filterLinks(navLinks);
  }, [searchTerm, allowedPages, currentUserState]);

  const renderMenuItems = (items, level = 0) => items.map(({ label, href = "", submenu }) => {
    const isOpen = !!openMenus[href], hasSub = submenu?.length;
    const isActive = href && pathname === href;
    const iconClass = theme.icons?.[label];

    if (hasSub) return (
      <li key={href||label} className={`menu-item has-submenu ${isActive?"active":""}`}>
        <button onClick={() => toggleSubMenu(href||label)} className={`menu-button ${isOpen?"open":""}`} style={{paddingLeft: level*16+12}}>
          {iconClass && <i className={`fa ${iconClass}`}></i>}
          {!sidebarOpen ? <span className="menu-tooltip">{label}</span> : <span className="menu-label">{label}</span>}
          {sidebarOpen && <FaChevronRight className={`chevron ${isOpen?"rotated":""}`}/>}
        </button>
        {sidebarOpen && <ul className={`submenu ${isOpen?"expanded":"collapsed"}`}>{renderMenuItems(submenu, level+1)}</ul>}
      </li>
    );

    return (
      <li key={href||label} className={`menu-item ${isActive?"active":""}`}>
        <Link href={href||"#"} className={`menu-link ${level>0?"submenu-link":""}`} style={{paddingLeft: level*16+12}}>
          {iconClass && <i className={`fa ${iconClass}`}></i>}
          {!sidebarOpen ? <span className="menu-tooltip">{label}</span> : <span className="menu-label">{label}</span>}
        </Link>
      </li>
    );
  });

  const activeBackground = theme.gradient || (theme.background ? `url(${theme.background}) no-repeat center/cover` : "#111");

  const filteredErrors = useMemo(() => {
    return mockErrorDatabase
      .filter(e => !activeTag || e.tags.includes(activeTag))
      .filter(e => !errorSearch || [e.code, e.desc, ...e.tags].some(t => t.toLowerCase().includes(errorSearch.toLowerCase())));
  }, [activeTag, errorSearch]);

  const getTagLabel = key => displayTags.find(t => t.key === key)?.label || key;

  return (
    <div className="dashboard-root">
      <div className="dashboard-background" style={{background:activeBackground}}/>
      <div className="dashboard-overlay"/>
      <div className="dashboard-container">

        <aside className={`sidebar ${sidebarOpen?"open":"closed"}`}>
          <div className="sidebar-header" onClick={() => setSidebarOpen(v=>!v)}>
            <div className="sidebar-logo-row">
              <img alt="Logo" className="sidebar-logo" src={theme.logo}/>
              {sidebarOpen && <span className="sidebar-title">{theme.title}</span>}
              <button className="sidebar-toggle-button" onClick={e=>{e.stopPropagation(); setSidebarOpen(v=>!v)}}><FaBars/></button>
            </div>
          </div>
          {sidebarOpen && <div className="sidebar-search"><input type="search" placeholder="Search menu..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/></div>}
          <nav className="sidebar-menu-container">
            {filteredNavLinks.length>0 ? <ul>{renderMenuItems(filteredNavLinks)}</ul> :
              <p style={{padding:"1rem",color:"#888"}}>⚠️ <strong>You must be logged in to gain permissions.</strong></p>}
          </nav>
          <SidebarUserInfo/>
          <footer className="sidebar-footer">
            {currentUserState ? <button className="auth-button" onClick={()=>{localStorage.removeItem(USER_KEY); setCurrentUserState(null)}}>🔓 Logout ({currentUserState.username||currentUserState.name||"User"})</button> :
              <Link href="/auth/login" className="auth-button">🔒 Login</Link>}
          </footer>
        </aside>

        <main>
          <div className="error-search-bar">
            <FaSearch className="search-icon"/>
            <input type="text" placeholder="Quickly search our documentation..." value={errorSearch} onChange={e=>setErrorSearch(e.target.value)}/>
          </div>

          {(errorSearch||filteredErrors.length>0) && 
            <div className="error-tag-filters" style={{margin:"0.5rem 0", display:"flex", flexWrap:"wrap", gap:"0.5rem", justifyContent:"center", alignItems:"center"}}>
              <button onClick={()=>setActiveTag("")} className={`tag-filter-button ${activeTag===""?"active":""}`}>All</button>
              {displayTags.map(t=>(
                <button key={t.key} onClick={()=>setActiveTag(prev=>prev===t.key?"":t.key)} className={`tag-filter-button ${activeTag===t.key?"active":""}`}>{t.label}</button>
              ))}
            </div>
          }

          {(errorSearch||activeTag) && 
            <div className="error-results">
              {filteredErrors.length>0 ? filteredErrors.map(e=>(
                <div key={e.code} className="error-item" onClick={()=>setSelectedError(e)} style={{cursor:"pointer",display:"flex",flexDirection:"column",gap:"0.25rem"}}>
                  <strong>{e.code}</strong>
                  <p>{e.desc}</p>
                  <div className="error-tags" style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>{e.tags.map(tag=><span key={tag} className="error-tag">{getTagLabel(tag)}</span>)}</div>
                </div>
              )) :
              <div className="error-item">No errors or help documentation found. If stuck, reach out to us on our discord.</div>}
            </div>
          }

          {selectedError && 
            <div className="error-modal-overlay" onClick={()=>setSelectedError(null)}>
              <div className="error-modal" onClick={e=>e.stopPropagation()}>
                <button className="error-modal-close" onClick={()=>setSelectedError(null)}><FaTimes/></button>
                <h2>⚠️ {selectedError.code}</h2>
                <p>{selectedError.desc}</p>
                <div className="error-tags">{selectedError.tags.map(tag=><span key={tag}>{getTagLabel(tag)}</span>)}</div>
              </div>
            </div>
          }

          <div className="content-inner">{children}</div>
          <div className="footer-text">© Modix Game Panel. 2024 - 2025</div>
        </main>
      </div>
    </div>
  );
}
