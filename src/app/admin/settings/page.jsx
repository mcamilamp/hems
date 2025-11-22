"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import "@/styles/admin/admin.scss";
import "@/styles/admin/settings.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import TabNavigation from "@/components/admin/settingsPage/TabNavigation";
import ProfileTab from "@/components/admin/settingsPage/ProfileTab";
import SecurityTab from "@/components/admin/settingsPage/SecurityTab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Datos del admin - en producción vendría de tu backend/context
  const [adminData, setAdminData] = useState({
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@admin.com",
    phone: "+57 300 123 4567",
    role: "Administrador Principal",
    avatar: null,
    registeredDate: "15 Enero 2024",
  });

  const handleUpdateProfile = (updatedData) => {
    setAdminData({ ...adminData, ...updatedData });
    // Aquí llamarías a tu API para actualizar
    console.log("Perfil actualizado:", updatedData);
  };

  const handleChangePassword = (passwordData) => {
    // Aquí llamarías a tu API para cambiar la contraseña
    console.log("Cambiar contraseña:", passwordData);
  };

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      // Aquí implementarías la lógica de logout
      console.log("Cerrando sesión...");
      // router.push("/login");
    }
  };

  return (
    <div className="admin-dashboard">
      <SideBarAdmin />
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
              <ProfileTab
                adminData={adminData}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
            {activeTab === "security" && (
              <SecurityTab
                onChangePassword={handleChangePassword}
                onLogout={handleLogout}
              />
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
