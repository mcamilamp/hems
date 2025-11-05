"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "../styles/homePage.scss";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="home-page">
      <div className="main-content">
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
