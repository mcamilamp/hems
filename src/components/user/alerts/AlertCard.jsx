"use client";
import {
  FaBolt,
  FaPlug,
  FaWrench,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Iconos y colores por tipo y nivel de alerta
const typeIcon = {
  consumo:   <FaBolt />,
  conexion:  <FaPlug />,
  mantenimiento: <FaWrench />,
  info:      <FaInfoCircle />,
};

const levelColor = {
  alta: "#ff4b4b",
  media: "#ffa500",
  baja: "#39ff14",
  info: "#00ffff",
};

export default function AlertCard({ alert, index, onRead }) {
  return (
    <motion.div
      className={`alert-card ${alert.level} ${alert.read ? "read" : "unread"}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <div className="alert-header">
        <div className="icon-level" style={{ color: "#ffffff", borderColor: levelColor[alert.level] }}>
          {typeIcon[alert.type] || <FaInfoCircle />}
        </div>
        <div className="alert-main">
          <h3>{alert.title}</h3>
          <p className="description">{alert.description}</p>
        </div>
        <div className="alert-chip" style={{ background: levelColor[alert.level] + "22", color: levelColor[alert.level] }}>
          {alert.level.charAt(0).toUpperCase() + alert.level.slice(1)}
        </div>
      </div>
      <div className="alert-footer">
        <span className="date">{alert.date}</span>
        <span className="device">{alert.device}</span>
        {!alert.read && (
          <button className="read-btn" onClick={() => onRead(alert.id)}><FaCheckCircle /> Marcar como leída</button>
        )}
      </div>
    </motion.div>
  );
}
