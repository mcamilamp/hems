import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { BiDevices } from "react-icons/bi";
import "../../styles/components/sideBar.scss";

export default function SideBarAdmin({ setActiveMenuItem }) {
  const menuItems = [
    { icon: <FaHome className="icon" />, label: "Inicio", href: "/admin" },
    {
      icon: <FaUser className="icon" />,
      label: "Usuarios",
      href: "/admin/userPage",
    },
    {
      icon: <BiDevices className="icon" />,
      label: "Dispositivos",
      href: "/admin/devices",
    },
    {
      icon: <FiSettings className="icon" />,
      label: "Configuración",
      href: "/admin/settings",
    },
  ];

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">HEMS</h1>
      <nav className="menu">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="menu-item">
              <Link href={item.href} className="menu-link">
                {item.icon} <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
