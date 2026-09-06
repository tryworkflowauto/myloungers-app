"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { sendGAEvent } from "@/lib/sendGAEvent";

type Props = {
  slug: string;
  name: string;
  itemListId: string;
  itemListName: string;
  className?: string;
  children: ReactNode;
};

export function KesfetTesisSelectLink({
  slug,
  name,
  itemListId,
  itemListName,
  className,
  children,
}: Props) {
  return (
    <Link
      href={`/tesis/${encodeURIComponent(slug)}`}
      className={className}
      onClick={() => {
        sendGAEvent("select_item", {
          item_list_id: itemListId,
          item_list_name: itemListName,
          items: [{ item_id: slug, item_name: name }],
        });
      }}
    >
      {children}
    </Link>
  );
}
