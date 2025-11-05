import "../../styles/components/loginRegister.scss";

export default function registerForm() {
  return (
    <form className="register-form">
      <h2>Regístrate</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre"
          id="name"
          name="name"
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          id="lastName"
          name="lastName"
          required
        />
        <input
          type="email"
          placeholder="Email"
          id="email"
          name="email"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          id="password"
          name="password"
          required
        />
        <button type="submit">Ingresar</button>
        <p>
          ¿Ya tienes una cuenta? <a href="/login">Inicia Sesión</a>
        </p>
      </div>
    </form>
  );
}
