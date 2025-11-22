"use client";
import { motion } from "framer-motion";
import { FaUserPlus, FaPowerOff, FaEdit, FaTrash, FaCog } from "react-icons/fa";

export default function RecentActivity() {
  const activities = [
    {
      icon: <FaUserPlus />,
      action: "Nuevo usuario registrado",
      user: "María Gómez",
      time: "Hace 5 minutos",
      type: "success",
    },
  ];

  return;
}
