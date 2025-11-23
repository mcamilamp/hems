"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaMobileAlt,
  FaChartLine,
  FaUser,
  FaBars,
  FaTimes,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";
import "../../styles/components/sideBarUser.scss";

export default function SidebarUser() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: <FaHome />, label: "Dashboard", href: "/user" },
    { icon: <FaMobileAlt />, label: "Mis Dispositivos", href: "/user/devices" },
    { icon: <FaChartLine />, label: "Consumo", href: "/user/consumption" },
    { icon: <FaBell />, label: "Alertas", href: "/user/alerts" },
    { icon: <FaUser />, label: "Mi Perfil", href: "/user/settings" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const isActive = (href) => {
    if (href === "/user") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.button
        className="hamburger-btn"
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar-user ${isOpen ? "open" : ""}`}
        initial={false}
      >
        <div className="sidebar-header">
          <motion.h1 className="sidebar-title">HEMS</motion.h1>
          <p className="sidebar-subtitle">Mi Energía</p>
        </div>

        <nav className="menu">
          <ul>
            {menuItems.map((item, index) => (
              <motion.li
                key={index}
                className={`menu-item ${isActive(item.href) ? "active" : ""}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 8 }}
              >
                <Link
                  href={item.href}
                  className="menu-link"
                  onClick={closeSidebar}
                >
                  <span className="icon-wrapper">{item.icon}</span>
                  <span className="label">{item.label}</span>
                  {isActive(item.href) && (
                    <motion.div
                      className="active-indicator"
                      layoutId="active"
                    />
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn">
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
