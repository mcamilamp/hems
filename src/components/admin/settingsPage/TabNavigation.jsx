"use client";
import { motion } from "framer-motion";
import { FaUser, FaShieldAlt } from "react-icons/fa";

export default function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "profile", label: "Perfil", icon: <FaUser /> },
    { id: "security", label: "Seguridad", icon: <FaShieldAlt /> },
  ];

  return (
    <div className="tabs-navigation">
      {tabs.map((tab, index) => (
        <motion.button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
