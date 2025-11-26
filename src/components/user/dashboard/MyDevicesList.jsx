"use client";
import { motion } from "framer-motion";
import { FaMobileAlt, FaPowerOff, FaBolt } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MyDevicesList() {
  const [devices, setDevices] = useState([]);
  
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get("/api/devices");
        setDevices(response.data.map(d => ({
          ...d,
          status: d.status === 'online',
          consumption: d.consumption || "0 kWh"
        })));
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchDevices();
  }, []);

  const toggleDevice = async (id) => {
    // Mock toggle for now, would require PATCH API update
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
