import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a6cff",
};

export const metadata: Metadata = {
  title: "MeusApoios — descobre a que apoios tens direito",
  description:
    "Diagnóstico claro de apoios, riscos e próximos passos. Agricultura, habitação, energia, empresas, formação e apoios sociais em Portugal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="grain min-h-screen antialiased">{children}</body>
    </html>
  );
}
