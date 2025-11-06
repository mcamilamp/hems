"use client";
import "@/styles/admin/admin.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import TableUser from "@/components/admin/userPage/tableUser";
import HeaderUser from "@/components/admin/userPage/headerUser";

export default function AdminUserPage() {
  return (
    <div className="admin-dashboard">
      <SideBarAdmin />
      <main className="main-content">
        <h1>Usuarios</h1>
        <div className="sections">
          <div className="container-user">
            <HeaderUser />
            <TableUser />
          </div>
        </div>
      </main>
    </div>
  );
}
