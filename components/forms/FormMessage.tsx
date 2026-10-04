import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

interface FormMessageProps {
  type: "success" | "error";
  title: string;
  children?: ReactNode;
}

/** Accessible form status banner announced to assistive technology. */
export default function FormMessage({ type, title, children }: FormMessageProps) {
  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertTriangle;

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`flex gap-3 rounded-lg border p-4 ${
        isSuccess
          ? "border-teal/30 bg-teal/5"
          : "border-red/30 bg-red/5"
      }`}
    >
      <Icon
        className={`mt-0.5 h-5 w-5 shrink-0 ${
          isSuccess ? "text-teal-dark" : "text-red-dark"
        }`}
        aria-hidden="true"
      />
      <div className="text-sm leading-relaxed">
        <p className="font-semibold text-text">{title}</p>
        {children && <div className="mt-1 text-muted">{children}</div>}
      </div>
    </div>
  );
}
