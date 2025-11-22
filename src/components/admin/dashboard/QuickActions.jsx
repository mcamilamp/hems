"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaPlusCircle, FaCog, FaFileAlt } from "react-icons/fa";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      icon: <FaUserPlus />,
      label: "Nuevo Usuario",
      description: "Agregar usuario al sistema",
      onClick: () => router.push("/admin/users"),
      color: "#00ffff",
    },
    {
      icon: <FaPlusCircle />,
      label: "Nuevo Dispositivo",
      description: "Registrar dispositivo",
      onClick: () => router.push("/admin/devices"),
      color: "#39ff14",
    },
    {
      icon: <FaFileAlt />,
      label: "Generar Reporte",
      description: "Exportar datos del sistema",
      onClick: () => alert("Generando reporte..."),
      color: "#a9d4e0",
    },
    {
      icon: <FaCog />,
      label: "Configuración",
      description: "Ajustes del sistema",
      onClick: () => router.push("/admin/settings"),
      color: "#ffa500",
    },
  ];

  return (
    <div className="quick-actions-card">
      <h2>Acciones Rápidas</h2>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            className="action-button"
            onClick={action.onClick}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="action-icon" style={{ color: action.color }}>
              {action.icon}
            </div>
            <div className="action-content">
              <h4>{action.label}</h4>
              <p>{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
