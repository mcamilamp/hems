"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import "../styles/homePage.scss";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === "authenticated") {
        if (session?.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/user");
        }
      } else {
        router.push("/user");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, session, status]);

  return (
    <main className="home-page">
      <div className="home-content">
        <Image src="/img/logo.png" alt="HEMS logo" width={100} height={100} />
        <div className="text-content">
          <h1>Bienvenido a HEMS</h1>
          <p>Home Energy Management Systems</p>
        </div>
        <div className="loader-bar">
          <div className="progress"></div>
        </div>
      </div>
    </main>
  );
}
