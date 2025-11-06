export default function TableUser() {
  const users = [
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
  ];

  return (
    <div className="table-userPage">
      <table>
        <thead>
          <tr>
            {["ID", "Nombre", "Email", "Rol", "Estado"].map((header) => (
              <th key={header}>{header}</th>
            ))}
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
