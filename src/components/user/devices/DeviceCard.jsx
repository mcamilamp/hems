"use client";
import { motion } from "framer-motion";
import {
  FaPowerOff,
  FaBolt,
  FaMapMarkerAlt,
  FaChartLine,
  FaCog,
} from "react-icons/fa";

export default function DeviceCard({ device, index, onToggle }) {
  return (
    <motion.div
      className={`device-card ${device.isOn ? "on" : "off"} ${
        device.status === "offline" ? "offline" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      {/* Status Badge */}
      <div className="status-badge">
        <span className={`status-dot ${device.status}`}></span>
        {device.status === "online" ? "En línea" : "Desconectado"}
      </div>

      {/* Device Header */}
      <div className="device-header">
        <div className="device-icon">{device.icon}</div>
        <div className="device-info">
          <h3>{device.name}</h3>
          <p className="device-type">{device.type}</p>
        </div>
      </div>

      {/* Device Stats */}
      <div className="device-stats">
        <div className="stat-item">
          <FaBolt className="stat-icon" />
          <div className="stat-details">
            <span className="stat-label">Ahora</span>
            <span className="stat-value">{device.currentConsumption}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaChartLine className="stat-icon" />
          <div className="stat-details">
            <span className="stat-label">Hoy</span>
            <span className="stat-value">{device.todayConsumption}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="device-location">
        <FaMapMarkerAlt />
        <span>{device.location}</span>
      </div>

      {/* Temperature (if HVAC) */}
      {device.temperature && (
        <div className="device-temperature">
          <span className="temp-label">Temperatura:</span>
          <span className="temp-value">{device.temperature}°C</span>
        </div>
      )}

      {/* Actions */}
      <div className="device-actions">
        <motion.button
          className={`power-btn ${device.isOn ? "on" : "off"}`}
          onClick={() => onToggle(device.id)}
          disabled={device.status === "offline"}
          whileTap={{ scale: 0.9 }}
        >
          <FaPowerOff />
          {device.isOn ? "Apagar" : "Encender"}
        </motion.button>
        <motion.button
          className="settings-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaCog />
        </motion.button>
      </div>
    </motion.div>
  );
}
