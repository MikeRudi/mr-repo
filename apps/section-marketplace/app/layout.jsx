import "./globals.css";

export const metadata = {
  title: "MakeReign Section Marketplace",
  description: "Browse and preview reusable sections, components, and full page templates.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
