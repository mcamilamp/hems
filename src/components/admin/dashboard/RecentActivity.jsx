"use client";
import { motion } from "framer-motion";
import { FaUserPlus, FaPowerOff, FaEdit, FaTrash, FaCog } from "react-icons/fa";

export default function RecentActivity() {
  const activities = [
    {
      icon: <FaUserPlus />,
      action: "Sistema iniciado",
      user: "System",
      time: "Ahora",
      type: "success",
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case "success":
        return "#39ff14";
      case "warning":
        return "#ffa500";
      case "error":
        return "#ff4b4b";
      default:
        return "#00ffff";
    }
  };

  return (
    <div className="recent-activity-card">
      <h2>Actividad Reciente</h2>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            className="activity-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className="activity-icon"
              style={{
                backgroundColor: `${getTypeColor(activity.type)}20`,
                color: getTypeColor(activity.type),
              }}
            >
              {activity.icon}
            </div>
            <div className="activity-content">
              <p className="activity-action">{activity.action}</p>
              <span className="activity-user">{activity.user}</span>
            </div>
            <span className="activity-time">{activity.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
