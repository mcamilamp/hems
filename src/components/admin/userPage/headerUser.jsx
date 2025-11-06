import "../../../styles/admin/userPage.scss";

export default function HeaderUser() {
  return (
    <div className="header-userPage">
      <div className="count">
        <h2>
          Cantidad de Usuarios: <span>150</span>
        </h2>
      </div>
      <div className="buttons-user">
        <button className="btn-addUser">Agregar Usuario</button>
      </div>
    </div>
  );
}
