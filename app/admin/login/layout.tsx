// Login sayfası için özel layout - AdminLayout'u bypass eder
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
