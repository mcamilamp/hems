import "../../styles/admin/admin.scss";
import { FaHome } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { BiDevices } from "react-icons/bi";

export default function AdminPage() {
  return (
    <div className="admin-dashboard">
      <aside>
        <h1>Admin dashboard</h1>
        <nav className="menu">
          <ul>
            <li>
              <FaHome></FaHome> Inicio
            </li>
          </ul>
          <ul>
            <li>
              <FaUser></FaUser> Usuarios
            </li>
          </ul>
          <ul>
            <li>
              <FiSettings></FiSettings> Configuración
            </li>
          </ul>

          <ul>
            <li>
              <BiDevices></BiDevices> Dispositivos
            </li>
          </ul>
        </nav>
      </aside>

      <main>
        <h1>Main</h1>
      </main>
    </div>
  );
}
