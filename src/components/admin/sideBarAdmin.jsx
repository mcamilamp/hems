import { FaHome } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { BiDevices } from "react-icons/bi";
import "../../styles/components/sideBar.scss";

export default function SideBarAdmin({ setActiveMenuItem }) {
  const menuItems = [
    { icon: <FaHome className="icon" />, label: "Inicio" },
    { icon: <FaUser className="icon" />, label: "Usuarios" },
    { icon: <FiSettings className="icon" />, label: "Configuración" },
    { icon: <BiDevices className="icon" />, label: "Dispositivos" },
  ];

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">HEMS</h1>
      <nav className="menu">
        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="menu-item"
              onClick={() => setActiveMenuItem(item.label)}
            >
              {item.icon} <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
