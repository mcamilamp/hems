"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import SidebarUser from "@/components/user/SidebarUser";
import TabNavigation from "@/components/user/settings/TabNavigation";
import ProfileTab from "@/components/user/settings/ProfileTab";
import SecurityTab from "@/components/user/settings/SecurityTab";
import CompanyTab from "@/components/user/settings/CompanyTab";
import "@/styles/user/userDashboard.scss";
import "@/styles/commonSettings.scss";
import { useSession } from "next-auth/react";
import axios from "axios";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  role: "",
  avatar: null,
  registeredDate: "",
};

// La API es la unica fuente de verdad del perfil. Antes esto se armaba desde
// la sesion, que no trae ni telefono ni fecha de alta: la fecha mostrada era
// `new Date()`, o sea el dia de hoy, siempre.
function toProfile(user) {
  return {
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role === "admin" ? "Administrador" : "Usuario",
    avatar: user.image || null,
    registeredDate: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
  };
}

export default function UserSettingsPage() {
  const { update: refreshSession } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(EMPTY_PROFILE);
  const [companyData, setCompanyData] = useState({ company: null, tariff: null, options: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        // En paralelo: son dos recursos independientes y encadenarlos solo
        // sumaria latencia.
        const [profile, company] = await Promise.all([
          axios.get("/api/user/profile"),
          axios.get("/api/company"),
        ]);

        if (!cancelled) {
          setUserData(toProfile(profile.data));
          setCompanyData(company.data);
        }
      } catch (error) {
        if (!cancelled) toast.error("No se pudo cargar tu perfil");
      } finally {
        // Pase lo que pase se apaga: si esto vive dentro del try, un error deja
        // la pantalla colgada en el loader para siempre.
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateProfile = async (data) => {
    try {
      const { data: updated } = await axios.patch("/api/user/profile", {
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      setUserData(toProfile(updated));
      // Sin esto el saludo del dashboard y el sidebar siguen con el nombre del
      // login. Dispara el callback jwt con trigger "update".
      await refreshSession({});
      toast.success("Perfil actualizado con éxito");
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al actualizar perfil"
      );
      return false;
    }
  };

  const handleSaveCompany = async (data) => {
    try {
      const { data: updated } = await axios.patch("/api/company", data);
      // La respuesta trae la tarifa recalculada para el perfil nuevo: si la
      // combinacion elegida no tiene cuadro cargado, la pantalla lo avisa.
      setCompanyData(updated);
      toast.success("Perfil de empresa actualizado");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar la empresa");
      return false;
    }
  };

  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    try {
      await axios.patch("/api/user/password", { currentPassword, newPassword });
      toast.success("Contraseña cambiada con éxito");
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al cambiar la contraseña"
      );
      return false;
    }
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
            {activeTab === "company" && (
              <CompanyTab
                company={companyData.company || {}}
                tariff={companyData.tariff}
                options={companyData.options}
                onSave={handleSaveCompany}
              />
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
