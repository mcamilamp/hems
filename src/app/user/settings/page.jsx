"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import SidebarUser from "@/components/user/SidebarUser";
import TabNavigation from "@/components/user/settings/TabNavigation";
import ProfileTab from "@/components/user/settings/ProfileTab";
import SecurityTab from "@/components/user/settings/SecurityTab";
import "@/styles/commonSettings.scss";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function UserSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    avatar: null,
    registeredDate: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
        role: session.user.role === "admin" ? "Administrador" : "Usuario",
        avatar: session.user.image || null,
        registeredDate: new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
      });
      setLoading(false);
    }
  }, [session]);

  const handleUpdateProfile = async (data) => {
    try {
      setUserData((u) => ({ ...u, ...data }));
      toast.success("Perfil actualizado con éxito");
    } catch (error) {
      toast.error("Error al actualizar perfil");
    }
  };

  const handleChangePassword = () => {
    toast.success("Contraseña cambiada con éxito");
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <SidebarUser />
        <main className="main-content">
          <div className="loading-container"><div className="loader"></div></div>
        </main>
      </div>
    );
  }

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
