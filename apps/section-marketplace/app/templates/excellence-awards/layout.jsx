// This nested layout reintroduces the Webflow CSS and runtime attributes
// scoped only to the Excellence Awards template route.

export const metadata = {
  title: "Excellence Awards 2026 | Priority Pass",
};

export default function ExcellenceAwardsLayout({ children }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="/webflow/css/normalize.css" />
      <link rel="stylesheet" href="/webflow/css/components.css" />
      <link rel="stylesheet" href="/webflow/css/excellence-awards.css" />
      <link rel="stylesheet" href="/styles.css" />
      <link rel="shortcut icon" href="/webflow/images/favicon.png" type="image/x-icon" />
      <link rel="apple-touch-icon" href="/webflow/images/webclip.png" />
      {children}
    </>
  );
}
