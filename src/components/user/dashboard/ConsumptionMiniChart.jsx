"use client";
import { motion } from "framer-motion";
import { FaBolt } from "react-icons/fa";

export default function ConsumptionMiniChart() {
  const weekData = [
    { day: "Lun", consumption: 20, percentage: 67 },
    { day: "Mar", consumption: 24, percentage: 80 },
    { day: "Mié", consumption: 18, percentage: 60 },
    { day: "Jue", consumption: 22, percentage: 73 },
    { day: "Vie", consumption: 19, percentage: 63 },
    { day: "Sáb", consumption: 15, percentage: 50 },
    { day: "Dom", consumption: 18, percentage: 60 },
  ];

  return (
    <div className="consumption-chart-card">
      <div className="card-header">
        <h2>Consumo de la Semana</h2>
        <button className="view-details-btn">Ver detalles</button>
      </div>

      <div className="chart-container">
        {weekData.map((data, index) => (
          <div key={data.day} className="bar-item">
            <motion.div
              className="bar"
              initial={{ height: 0 }}
              animate={{ height: `${data.percentage}%` }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
            >
              <span className="bar-value">{data.consumption}</span>
            </motion.div>
            <span className="bar-label">{data.day}</span>
          </div>
        ))}
      </div>

      <div className="chart-footer">
        <FaBolt className="footer-icon" />
        <span>Promedio diario: 19.4 kWh</span>
      </div>
    </div>
  );
}
