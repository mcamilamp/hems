import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Dashboard | HEMS",
  description: "Manage users, consumption, and devices of the HEMS system",
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?error=unauthorized&message=Debes iniciar sesión para acceder a esta sección");
  }

  if (session.user.role !== "admin") {
    redirect("/login?error=unauthorized&message=Solo administradores pueden acceder a esta sección");
  }

  return <section>{children}</section>;
}
