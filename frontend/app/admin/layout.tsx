/** Private administration is excluded from public automatic translation. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="hrpf-admin notranslate flex flex-1 flex-col" translate="no" lang="en" dir="ltr">{children}</div>;
}
