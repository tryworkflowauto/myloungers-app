"use client";

import { createContext, useContext } from "react";

type ToastContextValue = {
  showToast: (msg: string, color?: string) => void;
};

const AdminToastContext = createContext<ToastContextValue | null>(null);

export function AdminToastProvider({ children, showToast }: { children: React.ReactNode; showToast: (msg: string, color?: string) => void }) {
  return <AdminToastContext.Provider value={{ showToast }}>{children}</AdminToastContext.Provider>;
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) return { showToast: (_: string, __?: string) => {} };
  return ctx;
}
