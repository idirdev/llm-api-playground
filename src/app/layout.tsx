import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LLM API Playground",
  description: "Interactive playground for testing LLM APIs - GPT-4, Claude, Llama, Mistral",
  keywords: ["llm", "api", "playground", "gpt-4", "claude", "llama", "mistral"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
