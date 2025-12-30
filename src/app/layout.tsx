import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solar Generation Predictor | ALP",
  description:
    "Predict solar panel electricity generation based on your location, system configuration, and real-time weather data. Uses machine learning for accurate estimations.",
  keywords: [
    "solar",
    "solar panels",
    "energy prediction",
    "renewable energy",
    "photovoltaic",
    "kWh calculator",
    "solar energy forecasting",
    "solar energy prediction",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
