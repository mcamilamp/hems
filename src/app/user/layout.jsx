import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata = {
  title: "User Dashboard | HEMS",
  description: "User dashboard for HEMS system",
};

export default async function UserLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?error=unauthorized&message=Debes iniciar sesión para acceder a esta sección");
  }

  return <section>{children}</section>;
}
