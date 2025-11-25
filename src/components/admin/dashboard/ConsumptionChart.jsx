"use client";
import { motion } from "framer-motion";
import { FaBolt, FaChartLine } from "react-icons/fa";

export default function ConsumptionChart({ data }) {
  // Use passed data or default to empty
  const weekData = data || [
    { day: "Lun", consumption: 0, percentage: 0 },
    { day: "Mar", consumption: 0, percentage: 0 },
    { day: "Mié", consumption: 0, percentage: 0 },
    { day: "Jue", consumption: 0, percentage: 0 },
    { day: "Vie", consumption: 0, percentage: 0 },
    { day: "Sáb", consumption: 0, percentage: 0 },
    { day: "Dom", consumption: 0, percentage: 0 },
  ];

  const totalWeek = weekData.reduce((sum, day) => sum + day.consumption, 0).toFixed(1);
  const averageDay = (weekData.length ? totalWeek / weekData.length : 0).toFixed(1);

  return (
    <div className="consumption-chart-card">
      <div className="chart-header">
        <div className="header-left">
          <h2>Consumo Energético Semanal</h2>
          <p className="chart-subtitle">Últimos 7 días</p>
        </div>
        <div className="chart-stats">
          <div className="stat-item">
            <FaBolt className="stat-icon" />
            <div>
              <span className="stat-value">{totalWeek} kWh</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-item">
            <FaChartLine className="stat-icon" />
            <div>
              <span className="stat-value">{averageDay} kWh</span>
              <span className="stat-label">Promedio</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-bars">
          {weekData.map((data, index) => (
            <div key={index} className="bar-wrapper">
              <motion.div
                className="bar"
                initial={{ height: 0 }}
                animate={{ height: `${data.percentage}%` }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.8,
                  ease: "easeOut",
                }}
              >
                <span className="bar-value">{data.consumption.toFixed(1)}</span>
              </motion.div>
              <span className="bar-label">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color high"></div>
          <span>Alto consumo (&gt;50 kWh)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color medium"></div>
          <span>Consumo medio (40-50 kWh)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color low"></div>
          <span>Bajo consumo (&lt;40 kWh)</span>
        </div>
      </div>
    </div>
  );
}
