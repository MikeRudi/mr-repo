import "./globals.css";

export const metadata = {
  title: "Excellence Awards 2026 | Priority Pass",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/webflow/css/normalize.css" />
        <link rel="stylesheet" href="/webflow/css/components.css" />
        <link rel="stylesheet" href="/webflow/css/excellence-awards.css" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="shortcut icon" href="/webflow/images/favicon.png" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/webflow/images/webclip.png" />
        <meta name="google-site-verification" content="2ouT_fMuuznOx9EeYjMYpDX_yBh9f9fzbfoywh119Qc" />
        <link rel="alternate" hrefLang="x-default" href="/en-GB" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
