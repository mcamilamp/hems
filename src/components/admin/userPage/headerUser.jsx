import "../../../styles/admin/userPage.scss";

export default function HeaderUser({ totalUsers = 0, onAddUser }) {
  return (
    <div className="header-userPage">
      <div className="count">
        <h2>
          Cantidad de Usuarios: <span>{totalUsers}</span>
        </h2>
      </div>
      <div className="buttons-user">
        <button className="btn-addUser" onClick={onAddUser}>
          Agregar Usuario
        </button>
      </div>
    </div>
  );
}
