import "./globals.css";

export const metadata = {
  title: "MakeReign Web Builder",
  description: "Compose pages from the MakeReign Section Library.",
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
