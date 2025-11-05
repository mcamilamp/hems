import RegisterForm from "@/components/common/registerForm.jsx";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <main className="register">
      <div className="register-container">
        <div className="register-header">
          <Image src="/img/logo.png" alt="HEMS logo" width={70} height={70} />

          <h1>HEMS</h1>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
