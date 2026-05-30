import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "./providers";
import "@/index.css";

export const metadata: Metadata = {
  title: "Prode 2026",
  description: "FIFA 2026 Corporate Prode",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
