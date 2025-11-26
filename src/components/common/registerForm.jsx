"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import "../../styles/components/loginRegister.scss";

export default function RegisterForm() {
  const router = useRouter();
  const [data, setData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/auth/register", data);
      toast.success("Registro exitoso!");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Regístrate</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre"
          id="name"
          name="name"
          value={data.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          id="lastName"
          name="lastName"
          value={data.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          placeholder="Email"
          id="email"
          name="email"
          value={data.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          id="password"
          name="password"
          value={data.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <p>
          ¿Ya tienes una cuenta? <a href="/login">Inicia Sesión</a>
        </p>
      </div>
    </form>
  );
}
