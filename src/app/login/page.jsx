import LoginForm from "@/components/common/loginForm.jsx";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="login">
      <div className="login-container">
        <div className="login-header">
          <Image src="/img/logo.png" alt="HEMS logo" width={70} height={70} />

          <h1>HEMS</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
