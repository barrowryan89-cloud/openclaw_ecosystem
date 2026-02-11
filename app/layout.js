export const metadata = {
  title: "OpenClaw Ecosystem Dashboard",
  description: "Real-time dashboard tracking the OpenClaw (Clawdbot) ecosystem — GitHub activity, npm downloads, contributors, and more.",
  openGraph: {
    title: "OpenClaw Ecosystem Dashboard 🦞",
    description: "Live metrics for the OpenClaw open-source AI assistant ecosystem",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenClaw Ecosystem Dashboard 🦞",
    description: "Live metrics for the OpenClaw open-source AI assistant ecosystem",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦞</text></svg>" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#06070b" }}>
        {children}
      </body>
    </html>
  );
}
