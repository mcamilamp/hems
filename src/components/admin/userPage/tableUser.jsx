export default function TableUser({ users = [] }) {
  return (
    <div className="table-userPage">
      <table>
        <thead>
          <tr>
            {["ID", "Nombre", "Email", "Rol", "Estado", "Acciones"].map(
              (header) => (
                <th key={header}>{header}</th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {users.map(({ id, name, email, role, status }) => (
            <tr key={id}>
              <td>{id}</td>
              <td>{name}</td>
              <td>{email}</td>
              <td>{role}</td>
              <td
                className={
                  status === "Activo" ? "status-active" : "status-inactive"
                }
              >
                {status}
              </td>
              <td>
                <div className="btn-sec">
                  <button className="btn-edit">Editar</button>
                  <button className="btn-delete">Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
