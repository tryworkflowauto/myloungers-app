import "@/app/myloungers.css";
import "./kesfet.css";
import { KesfetShell } from "./_components/KesfetShell";

export const dynamic = "force-dynamic";

export default function KesfetLayout({ children }: { children: React.ReactNode }) {
  return <KesfetShell>{children}</KesfetShell>;
}
