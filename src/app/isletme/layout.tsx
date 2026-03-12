import IsletmeSidebar from "./IsletmeSidebar";

export default function IsletmeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <IsletmeSidebar />
      <main className="overflow-auto" style={{ marginLeft: 260 }}>
        {children}
      </main>
    </div>
  );
}
