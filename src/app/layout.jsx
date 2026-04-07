import { Suspense } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import MetaPixelTracker from "@/components/MetaPixelTracker";
import Providers from "@/components/Providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "GadgetShob - Demo",
  description: "GadgetShob frontend demo with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${poppins.variable} m-0 min-h-screen bg-white font-sans text-ink-900`}
      >
        <Providers>
          <Suspense fallback={null}>
            <MetaPixelTracker />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
