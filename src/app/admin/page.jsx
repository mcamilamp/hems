"use client";
import { useState } from "react";
import "../../styles/admin/admin.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import UsersSection from "@/components/admin/usersSection";
import DevicesSection from "@/components/admin/devicesSection";

export default function AdminPage() {
  const [activeMenuItem, setActiveMenuItem] = useState("Inicio");

  const renderSection = () => {
    switch (activeMenuItem) {
      case "Usuarios":
        return <UsersSection />;
      default:
        return <div>Bienvenido al panel de administración</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      <SideBarAdmin setActiveMenuItem={setActiveMenuItem} />
      <main className="main-content">
        <h1>{activeMenuItem}</h1>
        {renderSection()}
        <div className="sections">
          <UsersSection />
          <DevicesSection />
        </div>
      </main>
    </div>
  );
}
