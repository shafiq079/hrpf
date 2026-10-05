import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface SubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: "teal" | "navy" | "gold" | "red";
}

const variants = {
  teal: "bg-teal text-white hover:bg-teal-dark",
  navy: "bg-navy text-white hover:bg-navy-dark",
  gold: "bg-gold text-navy hover:bg-gold-dark",
  red: "bg-red text-white hover:bg-red-dark",
};

/** Submit button with an accessible loading state. */
export default function SubmitButton({
  children,
  loading = false,
  fullWidth = false,
  variant = "navy",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-[15px] font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${
        variants[variant]
      } ${fullWidth ? "w-full" : ""}`}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
