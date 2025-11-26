import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  FaPowerOff,
  FaBolt,
  FaMapMarkerAlt,
  FaChartLine,
  FaCog,
} from "react-icons/fa";

export default function DeviceCard({ device, index, onToggle, icon }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
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
      <div className="status-badge">
        <span className={`status-dot ${device.status}`}></span>
        {device.status === "online" ? "En línea" : "Desconectado"}
      </div>

      <div className="device-header">
        <div className="device-icon">{icon}</div>
        <div className="device-info">
          <h3>{device.name}</h3>
          <p className="device-type">{device.type}</p>
        </div>
      </div>

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

      <div className="device-location">
        <FaMapMarkerAlt />
        <span>{device.location}</span>
      </div>

      {device.temperature && (
        <div className="device-temperature">
          <span className="temp-label">Temperatura:</span>
          <span className="temp-value">{device.temperature}°C</span>
        </div>
      )}

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
          onClick={() => {
            if (isAdmin) {
              router.push(`/admin/devices/${device.id}`);
            } else {
              toast("Configuración de dispositivo en desarrollo");
            }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={isAdmin ? "Ver detalles del dispositivo (Admin)" : "Configurar dispositivo"}
        >
          <FaCog />
        </motion.button>
      </div>
    </motion.div>
  );
}
