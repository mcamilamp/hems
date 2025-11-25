"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaBolt, FaCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function TopDevices() {
  const router = useRouter();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get("/api/devices");
        // Sort by consumption value (parse "XX kWh" -> float)
        const sorted = response.data
          .map(d => ({
            ...d,
            numericConsumption: parseFloat(d.consumption.split(' ')[0])
          }))
          .sort((a, b) => b.numericConsumption - a.numericConsumption)
          .slice(0, 5);

        const max = sorted[0]?.numericConsumption || 100;

        setDevices(sorted.map(d => ({
          id: d.id,
          name: d.name,
          consumption: d.consumption,
          status: d.status,
          percentage: (d.numericConsumption / max) * 100
        })));
      } catch (error) {
        console.error("Error loading top devices", error);
      }
    };
    fetchDevices();
  }, []);

  return (
    <div className="top-devices-card">
      <div className="card-header">
        <h2>Dispositivos con Mayor Consumo</h2>
        <button
          className="view-all-btn"
          onClick={() => router.push("/admin/devices")}
        >
          Ver todos
        </button>
      </div>
      <div className="devices-list">
        {devices.length === 0 ? (
          <p style={{padding: '20px'}}>No hay datos suficientes.</p>
        ) : (
          devices.map((device, index) => (
            <motion.div
              key={device.id}
              className="device-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <div className="devices info">
                <div className="device-name-row">
                  <FaCircle className={`status-dot ${device.status}`} />
                  <span className="device-name">{device.name}</span>
                </div>
                <div className="consumption-row">
                  <FaBolt className="bolt-icon" />
                  <span className="consumption-value">{device.consumption}</span>
                </div>
              </div>
              <div className="consumption-bar">
                <motion.div
                  className="consumption-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${device.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
