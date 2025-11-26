"use client";
import { motion } from "framer-motion";
import { FaBolt } from "react-icons/fa";

export default function ConsumptionMiniChart({ data }) {
  const weekData = data || [
    { day: "Lun", consumption: 0, percentage: 0 },
    { day: "Mar", consumption: 0, percentage: 0 },
    { day: "Mié", consumption: 0, percentage: 0 },
    { day: "Jue", consumption: 0, percentage: 0 },
    { day: "Vie", consumption: 0, percentage: 0 },
    { day: "Sáb", consumption: 0, percentage: 0 },
    { day: "Dom", consumption: 0, percentage: 0 },
  ];

  // Calculate average safely
  const total = weekData.reduce((sum, d) => sum + d.consumption, 0);
  const average = weekData.length ? (total / weekData.length).toFixed(1) : 0;

  return (
    <div className="consumption-chart-card">
      <div className="card-header">
        <h2>Consumo de la Semana</h2>
        <button className="view-details-btn">Ver detalles</button>
      </div>

      <div className="chart-container">
        {weekData.map((data, index) => (
          <div key={index} className="bar-item">
            <motion.div
              className="bar"
              initial={{ height: 0 }}
              animate={{ height: `${data.percentage}%` }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
            >
              <span className="bar-value">{data.consumption.toFixed(1)}</span>
            </motion.div>
            <span className="bar-label">{data.day}</span>
          </div>
        ))}
      </div>

      <div className="chart-footer">
        <FaBolt className="footer-icon" />
        <span>Promedio diario: {average} kWh</span>
      </div>
    </div>
  );
}
