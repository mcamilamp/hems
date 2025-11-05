import "../../styles/components/loginPage.scss";

export default function loginForm() {
  return (
    <form className="login-form">
      <h2>Iniciar Sesión</h2>
      <div className="form-group">
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
          ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </form>
  );
}
