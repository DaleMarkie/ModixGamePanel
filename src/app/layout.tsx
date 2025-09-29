import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ModuleProvider } from "./ModuleContext";
import { UserProvider } from "./UserContext";
import { ContainerProvider } from "./ContainerContext";

// Replace Geist with Inter
const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Replace Geist_Mono with Roboto Mono
const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: "#121212",
          minHeight: "100vh",
          color: "white",
        }}
      >
        <ModuleProvider>
          <ContainerProvider>
            <UserProvider>{children}</UserProvider>
          </ContainerProvider>
        </ModuleProvider>
      </body>
    </html>
  );
}
