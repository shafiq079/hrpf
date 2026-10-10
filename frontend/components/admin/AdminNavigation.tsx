"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const contentLinks = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/board", label: "Board of Directors" },
  { href: "/admin/team", label: "Operational Team" },
];
const complaintLink = { href: "/admin/complaints", label: "Complaints" };

export default function AdminNavigation({ contentAllowed = true }: { contentAllowed?: boolean }) {
  const pathname = usePathname();
  const links = contentAllowed ? [...contentLinks, complaintLink] : [complaintLink];
  return (
    <nav aria-label="Administration" className="mb-6 border-b border-border pb-4">
      <ul className="flex flex-wrap gap-2">
        {links.map(link => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-navy text-white" : "text-navy hover:bg-soft-gray"}`}
            >{link.label}</Link>
          </li>;
        })}
      </ul>
    </nav>
  );
}
