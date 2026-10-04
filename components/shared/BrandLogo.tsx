import Image from "next/image";

interface BrandLogoProps {
  /** Visual size of the circular mark. */
  size?: number;
  className?: string;
  /** Use a white-friendly treatment on dark backgrounds. */
  onDark?: boolean;
}

/**
 * Official HRPF emblem. The mark already includes the HRPF wordmark,
 * so call sites should not add a separate text label beside it.
 */
export default function BrandLogo({
  size = 40,
  className = "",
  onDark = false,
}: BrandLogoProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${
        onDark ? "bg-white p-0.5" : ""
      } ${className}`}
      style={{ width: size, height: size, borderRadius: "50%" }}
    >
      <Image
        src="/images/hrpf-logo.png"
        alt="Human Rights Protection Foundation"
        width={size}
        height={size}
        className="h-full w-full object-contain"
        priority
      />
    </span>
  );
}
