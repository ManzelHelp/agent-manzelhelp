import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In Next.js App Router, the root layout should only return children
  // The html and body tags are handled by the locale layout
  return <>{children}</>;
}
