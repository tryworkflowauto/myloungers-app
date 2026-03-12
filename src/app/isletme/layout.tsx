import IsletmeSidebar from "./IsletmeSidebar";

export default function IsletmeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <IsletmeSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
