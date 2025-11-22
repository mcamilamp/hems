"use client";
import { motion } from "framer-motion";
import { FaPlusCircle, FaMobileAlt, FaBolt } from "react-icons/fa";

export default function HeaderDevices({
  onAddDevice,
  totalDevices,
  activeDevices,
}) {
  return (
    <div className="header-devicesPage">
      <div className="stats-cards">
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaMobileAlt className="stat-icon" />
          <div className="stat-info">
            <h3>{totalDevices}</h3>
            <p>Total Dispositivos</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card active"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FaBolt className="stat-icon" />
          <div className="stat-info">
            <h3>{activeDevices}</h3>
            <p>Dispositivos Activos</p>
          </div>
        </motion.div>
      </div>

      <div className="buttons-devices">
        <motion.button
          onClick={onAddDevice}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FaPlusCircle style={{ marginRight: "0.5rem" }} />
          Agregar Dispositivo
        </motion.button>
      </div>
    </div>
  );
}
