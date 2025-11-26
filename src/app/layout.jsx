import "../styles/globals.scss";
import { DM_Sans } from "next/font/google";
import Providers from "@/components/Providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "HEMS",
  description: "Home Energy Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>HEMS</title>
      </head>
      <body className={dmSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
