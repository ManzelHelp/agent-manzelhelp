import Footer from "@/components/Footer";

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

