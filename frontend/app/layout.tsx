import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, Inter } from "next/font/google";
import { StoreProvider } from "@/components/providers/StoreProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter-google",
  subsets: ["latin"],
  weight: ["500"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "VedaAI | Exams",
  description: "Upload a question paper and answer sheet to start mapping.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
