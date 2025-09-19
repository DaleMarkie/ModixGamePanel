import React, { useState, ReactNode } from "react";
import { FaChevronRight, FaBars } from "react-icons/fa";
import { navLinks } from "./navConfig"; // no .ts extension needed
import SidebarUserInfo from "./SidebarUserInfo";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface OpenMenus {
  [key: string]: boolean;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<OpenMenus>({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSubMenu = (href: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const filteredNavLinks = navLinks
    .map(({ label, href, submenu }) => {
      if (!searchTerm) return { label, href, submenu };
      const lowerSearch = searchTerm.toLowerCase();
      const mainMatch = label.toLowerCase().includes(lowerSearch);

      let filteredSubmenu = null;
      if (submenu) {
        filteredSubmenu = submenu
          .map(({ label: sLabel, href: sHref, submenu: ss }) => {
            if (!ss) {
              return sLabel.toLowerCase().includes(lowerSearch)
                ? { label: sLabel, href: sHref }
                : null;
            } else {
              const filteredSubSubmenu = ss.filter((ssItem) =>
                ssItem.label.toLowerCase().includes(lowerSearch)
              );
              if (
                sLabel.toLowerCase().includes(lowerSearch) ||
                filteredSubSubmenu.length > 0
              ) {
                return {
                  label: sLabel,
                  href: sHref,
                  submenu: filteredSubSubmenu,
                };
              }
              return null;
            }
          })
          .filter(Boolean);
      }

      if (mainMatch || (filteredSubmenu && filteredSubmenu.length > 0)) {
        return { label, href, submenu: filteredSubmenu };
      }
      return null;
    })
    .filter(Boolean);

  const renderMenuItems = (items: typeof navLinks, level = 0): JSX.Element => {
    return (
      <ul
        style={{
          listStyle: "none",
          margin: level === 0 ? 0 : "6px 0 6px 12px",
          paddingLeft: level === 0 ? 0 : "14px",
          borderLeft: level === 0 ? "none" : "2px solid #2a2a2a",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        {items.map(({ label, href, submenu }) => {
          const isOpen = !!openMenus[href];
          const hasSubmenu = submenu && submenu.length > 0;

          if (hasSubmenu) {
            return (
              <li key={href} style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`submenu-${href}`}
                  onClick={() => toggleSubMenu(href)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    fontWeight: 600,
                    fontSize: level === 0 ? 15 : 14,
                    borderRadius: 8,
                    border: "none",
                    padding: level === 0 ? "10px 16px" : "8px 16px",
                    color: "#eee",
                    background: isOpen ? "#2a6e3a" : "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isOpen)
                      e.currentTarget.style.backgroundColor = "#237a30";
                  }}
                  onMouseLeave={(e) => {
                    if (!isOpen)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span>{label}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      marginLeft: 8,
                      transition: "transform 0.3s ease",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaChevronRight />
                  </span>
                </button>
                <ul
                  id={`submenu-${href}`}
                  role="region"
                  aria-label={`${label} submenu`}
                  style={{
                    maxHeight: isOpen ? "9999px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.35s ease",
                  }}
                >
                  {renderMenuItems(submenu, level + 1)}
                </ul>
              </li>
            );
          } else {
            return (
              <li key={href} style={{ marginBottom: 8 }}>
                <a
                  href={href}
                  style={{
                    display: "block",
                    fontWeight: level === 0 ? 600 : 500,
                    fontSize: level === 0 ? 15 : 14,
                    padding: level === 0 ? "10px 16px" : "8px 16px",
                    color: level === 0 ? "#eee" : "#ccc",
                    borderRadius: 8,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "background-color 0.3s ease, color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      level === 0 ? "#28a745" : "#218838";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = level === 0 ? "#eee" : "#ccc";
                  }}
                >
                  {label}
                </a>
              </li>
            );
          }
        })}
      </ul>
    );
  };

  return (
    <>
      {/* Keep your <style> here as in your original code */}
      <div className="dashboard-root" role="main">
        <div aria-hidden="true" className="dashboard-overlay" />

        <div
          className="dashboard-container"
          role="region"
          aria-label="Main Dashboard Layout"
        >
          <aside
            className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
            aria-label="Primary navigation sidebar"
          >
            <div
              tabIndex={0}
              className={`sidebar-header ${sidebarOpen ? "open" : "closed"}`}
              onClick={() => setSidebarOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSidebarOpen((v) => !v);
                }
              }}
              role="button"
              aria-pressed={sidebarOpen}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <div className="sidebar-logo-row">
                <img
                  alt="Modix Logo"
                  className="sidebar-logo"
                  src="https://i.ibb.co/cMPwcn8/logo.png"
                  fetchPriority="high"
                />
                {sidebarOpen && (
                  <span className="sidebar-title">Modix Game Panel</span>
                )}
                <button
                  aria-label={
                    sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                  }
                  className="sidebar-toggle-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen((v) => !v);
                  }}
                  title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                  tabIndex={-1}
                >
                  <FaBars />
                </button>
              </div>
            </div>

            {sidebarOpen && (
              <div className="sidebar-search" role="search">
                <input
                  type="search"
                  aria-label="Search navigation menu"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            )}

            <nav
              className="sidebar-menu-container"
              aria-label="Sidebar navigation menu"
              role="navigation"
              tabIndex={-1}
            >
              {renderMenuItems(filteredNavLinks)}
            </nav>

            {sidebarOpen && <SidebarUserInfo />}
            {sidebarOpen && (
              <footer className="sidebar-footer" aria-hidden="true">
                &copy; 2024 - 2025 Modix Game Panel
              </footer>
            )}
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </>
  );
}
