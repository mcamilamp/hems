"use client";
import { motion } from "framer-motion";
import { FaMobileAlt, FaPowerOff, FaBolt } from "react-icons/fa";
import axios from "axios";
import usePolling, { POLL_AGGREGATE } from "@/hooks/usePolling";

export default function MyDevicesList() {
  const { data, refetch: refetchDevices } = usePolling("/api/devices", {
    intervalMs: POLL_AGGREGATE,
    transform: (rows) =>
      rows.map((d) => ({
        ...d,
        status: d.status === "online",
        consumption: d.consumption || "0 kWh",
      })),
  });
  const devices = data ?? [];

  const toggleDevice = async (id) => {
    try {
      const device = devices.find(d => d.id === id);
      const newStatus = !device.status;

      await axios.patch(`/api/devices/${id}`, {
        status: newStatus ? 'online' : 'offline'
      });

      // Ver el comentario en user/devices/page.jsx: el state local optimista
      // lo pisaba el tick siguiente del poll. Releemos del server.
      refetchDevices();
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  return (
    <div className="my-devices-card">
      <div className="card-header">
        <h2>Mis Dispositivos</h2>
        <span className="device-count">{devices.length} dispositivos</span>
      </div>

      <div className="devices-list">
        {devices.length === 0 ? <p style={{padding: '20px'}}>No tienes dispositivos.</p> : devices.map((device, index) => (
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
