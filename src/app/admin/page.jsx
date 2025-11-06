"use client";
import { useState } from "react";
import "../../styles/admin/admin.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import UsersSection from "@/components/admin/usersSection";
import DevicesSection from "@/components/admin/devicesSection";

export default function AdminPage() {
  return (
    <div className="admin-dashboard">
      <SideBarAdmin />
      <main className="main-content">
        <h1>Bienvenido al panel de administración</h1>
        <div className="sections">
          <UsersSection />
          <DevicesSection />
        </div>
      </main>
    </div>
  );
}
