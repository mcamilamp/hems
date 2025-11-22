"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
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
    console.log("Perfil actualizado:", updatedData);
    toast.success("Perfil actualizado con éxito");
  };

  const handleChangePassword = (passwordData) => {
    console.log("Cambiar contraseña:", passwordData);
    toast.success("Contraseña cambiada con éxito");
  };

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      console.log("Cerrando sesión...");
      toast.success("Sesión cerrada");
      setTimeout(() => {
        // router.push("/login");
      }, 1000);
    }
  };

  return (
    <div className="admin-dashboard">
      <Toaster position="top-right" />
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
