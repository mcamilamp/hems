"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import SidebarUser from "@/components/user/SidebarUser";
import TabNavigation from "@/components/user/settings/TabNavigation";
import ProfileTab from "@/components/user/settings/ProfileTab";
import SecurityTab from "@/components/user/settings/SecurityTab";
import "@/styles/commonSettings.scss";

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    name: "María Gómez",
    email: "maria.gomez@ejemplo.com",
    phone: "+57 300 123 4567",
    role: "Usuario Registrado",
    avatar: null,
    registeredDate: "15 Enero 2024",
  });

  const handleUpdateProfile = (data) => {
    setUserData((u) => ({ ...u, ...data }));
    toast.success("Perfil actualizado con éxito");
  };

  const handleChangePassword = () => {
    toast.success("Contraseña cambiada con éxito");
  };

  return (
    <div className="user-dashboard">
      <Toaster position="top-right" />
      <SidebarUser />
      <main className="main-content">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Configuración
        </motion.h1>
        <motion.div
          className="settings-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="tab-content">
            {activeTab === "profile" && (
              <ProfileTab userData={userData} onUpdateProfile={handleUpdateProfile} />
            )}
            {activeTab === "security" && (
              <SecurityTab onChangePassword={handleChangePassword} />
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
