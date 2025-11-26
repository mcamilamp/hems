"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import "../../styles/components/loginRegister.scss";
import { toast } from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = searchParams?.get("error");
    const message = searchParams?.get("message");
    if (error === "unauthorized" && message) {
      toast.error(message);
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user) {
      if (session.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    }
  }, [session, router]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error("Credenciales inválidas");
        setLoading(false);
      } else {
        setTimeout(async () => {
          const response = await fetch("/api/auth/session");
          const sessionData = await response.json();
          
          if (sessionData?.user?.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/user");
          }
          router.refresh();
        }, 100);
      }
    } catch (error) {
      toast.error("Ocurrió un error");
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      <div className="form-group">
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
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <p>
          ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </form>
  );
}
