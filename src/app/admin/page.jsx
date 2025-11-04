import "../../styles/admin/admin.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import UsersSection from "@/components/admin/usersSection";

export default function AdminPage() {
  return (
    <div className="admin-dashboard">
      <SideBarAdmin />
      <main className="main-content">
        <h1>Admin Dashboard</h1>
        <UsersSection />
      </main>
    </div>
  );
}
