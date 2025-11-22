"use client";
import { motion } from "framer-motion";
import { FaBolt, FaCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function TopDevices() {
  const router = useRouter();

  const topDevices = [
    {
      id: 1,
      name: "Aire Acondicionado Principal",
      consumption: "3.8 kWh",
      status: "online",
      percentage: 95,
    },
    {
      id: 2,
      name: "Calentador de Agua",
      consumption: "2.5 kWh",
      status: "online",
      percentage: 78,
    },
    {
      id: 3,
      name: "Refrigerador Cocina",
      consumption: "1.2 kWh",
      status: "online",
      percentage: 45,
    },
    {
      id: 4,
      name: "Lavadora",
      consumption: "0.8 kWh",
      status: "offline",
      percentage: 30,
    },
    {
      id: 5,
      name: "Microondas",
      consumption: "0.5 kWh",
      status: "online",
      percentage: 20,
    },
  ];

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
        {topDevices.map((device, index) => (
          <motion.div
            key={device.id}
            className="device-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <div className="devices info"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
