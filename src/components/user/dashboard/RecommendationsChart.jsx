"use client";
import { motion } from "framer-motion";
import { FaLightbulb, FaLeaf, FaClock } from "react-icons/fa";

export default function RecommendationsCard() {
  const recommendations = [
    {
      icon: <FaLightbulb />,
      title: "Optimiza tu aire acondicionado",
      description: "Ajusta la temperatura a 24°C para ahorrar hasta 15%",
      impact: "Alto",
      color: "#ffa500",
    },
    {
      icon: <FaClock />,
      title: "Usa electrodomésticos en horario valle",
      description: "Programa tu lavadora entre 10PM y 6AM",
      impact: "Medio",
      color: "#00ffff",
    },
    {
      icon: <FaLeaf />,
      title: "Desconecta dispositivos en stand-by",
      description: "Ahorra hasta 10% desconectando cuando no uses",
      impact: "Bajo",
      color: "#39ff14",
    },
  ];

  return (
    <div className="recommendations-card">
      <h2>Recomendaciones de Ahorro</h2>
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            className="recommendation-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <div className="rec-icon" style={{ color: rec.color }}>
              {rec.icon}
            </div>
            <div className="rec-content">
              <h4>{rec.title}</h4>
              <p>{rec.description}</p>
              <span className={`impact-badge ${rec.impact.toLowerCase()}`}>
                Impacto {rec.impact}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
