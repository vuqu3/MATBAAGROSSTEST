export const metadata = {
  title: 'Machine Prime | MatbaaGross',
  description: 'Türkiye\'nin tek kurumsal endüstriyel matbaa makineleri pazar yeri.',
};

export default function MachinePrimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
