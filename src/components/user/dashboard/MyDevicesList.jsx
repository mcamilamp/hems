"use client";
import { motion } from "framer-motion";
import { FaMobileAlt, FaPowerOff, FaBolt } from "react-icons/fa";
import { useState } from "react";

export default function MyDevicesList() {
  const [devices, setDevices] = useState([
    { id: 1, name: "Aire Acondicionado", status: true, consumption: "2.5 kWh" },
    { id: 2, name: "Refrigerador", status: true, consumption: "1.2 kWh" },
    { id: 3, name: "Lavadora", status: false, consumption: "0 kWh" },
    { id: 4, name: "Televisor", status: true, consumption: "0.3 kWh" },
  ]);

  const toggleDevice = (id) => {
    setDevices(
      devices.map((d) => (d.id === id ? { ...d, status: !d.status } : d))
    );
  };

  return (
    <div className="my-devices-card">
      <div className="card-header">
        <h2>Mis Dispositivos</h2>
        <span className="device-count">{devices.length} dispositivos</span>
      </div>

      <div className="devices-list">
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            className="device-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="device-info">
              <FaMobileAlt className="device-icon" />
              <div className="device-details">
                <h4>{device.name}</h4>
                <span className="consumption">
                  <FaBolt /> {device.consumption}
                </span>
              </div>
            </div>
            <motion.button
              className={`toggle-btn ${device.status ? "on" : "off"}`}
              onClick={() => toggleDevice(device.id)}
              whileTap={{ scale: 0.9 }}
            >
              <FaPowerOff />
              {device.status ? "ON" : "OFF"}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
