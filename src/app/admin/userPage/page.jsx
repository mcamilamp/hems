"use client";
import "@/styles/admin/admin.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import TableUser from "@/components/admin/userPage/tableUser";
import HeaderUser from "@/components/admin/userPage/headerUser";
import { useState } from "react";

export default function AdminUserPage() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Juan Pérez",
      email: "a@gmail.com",
      role: "Administrador",
      status: "Activo",
    },
    {
      id: 2,
      name: "María Gómez",
      email: "b@gmail.com",
      role: "Usuario",
      status: "Inactivo",
    },
    {
      id: 3,
      name: "Carlos López",
      email: "c@gmail.com",
      role: "Usuario",
      status: "Activo",
    },
  ]);

  const handleAddUser = () => {
    const newUser = {
      id: users.length + 1,
      name: "Nuevo Usuario",
      email: `nuevo${users.length + 1}@gmail.com`,
      role: "Usuario",
      status: "Activo",
    };
    setUsers([...users, newUser]);
  };

  return (
    <div className="admin-dashboard">
      <SideBarAdmin />
      <main className="main-content">
        <h1>Usuarios</h1>
        <div className="sections">
          <div className="container-user">
            <HeaderUser totalUsers={users.length} onAddUser={handleAddUser} />
            <TableUser users={users} />
          </div>
        </div>
      </main>
    </div>
  );
}
