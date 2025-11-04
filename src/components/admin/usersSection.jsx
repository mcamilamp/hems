import "../../styles/components/_tables.scss";

export default function UsersSection() {
  const users = [
    { id: 1, name: "Juan Perez", email: "juan@juan.com", role: "Admin" },
    { id: 2, name: "Maria Gomez", email: "maria@maria.com", role: "User" },
    { id: 3, name: "Carlos Lopez", email: "carlos@carlos.com", role: "User" },
  ];

  return (
    <div className="table-container">
      <h2>Usuarios registrados</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
