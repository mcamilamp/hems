"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaHome, FaUser, FaCog } from "react-icons/fa";

import "../../styles/components/sideBar.scss";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", icon: <FaHome />, href: "/admin" },
    { label: "Usuarios", icon: <FaUser />, href: "/admin/users" },
    { label: "Configuración", icon: <FaCog />, href: "/admin/settings" },
  ];

  return (
    <>
      {/* BOTÓN HAMBURGUESA */}
      <button className="hamburger-btn" onClick={() => setOpen(!open)}>
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* OVERLAY */}
      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">HEMS</h2>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>

        <div className="menu">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.href}
                className={`menu-item ${
                  pathname === item.href ? "active" : ""
                }`}
                onClick={() => setOpen(false)}
              >
                <Link href={item.href} className="menu-link">
                  <span className="icon-wrapper">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer">
          <p>Usuario Admin</p>
        </div>
      </div>
    </>
  );
}
