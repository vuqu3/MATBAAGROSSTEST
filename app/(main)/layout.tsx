import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
