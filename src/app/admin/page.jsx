import "../../styles/admin/admin.scss";
import { FaHome } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { BiDevices } from "react-icons/bi";

export default function AdminPage() {
  const menuItems = [
    { icon: <FaHome className="icon" />, label: "Inicio" },
    { icon: <FaUser className="icon" />, label: "Usuarios" },
    { icon: <FiSettings className="icon" />, label: "Configuración" },
    { icon: <BiDevices className="icon" />, label: "Dispositivos" },
  ];

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h1 className="sidebar-title">Admin dashboard</h1>
        <nav className="menu">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className="menu-item">
                {item.icon} <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <h1>Main</h1>
      </main>
    </div>
  );
}
