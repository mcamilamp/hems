"use client";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userDashboard.scss";

export default function UserSettingsPage() {
  return (
    <div className="user-dashboard">
      <SidebarUser />
      <main className="main-content">
        <h1>Configuración</h1>
        <p>Página en construcción.</p>
      </main>
    </div>
  );
}

