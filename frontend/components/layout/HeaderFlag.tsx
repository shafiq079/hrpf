import Image from "next/image";

interface HeaderFlagProps {
  flag: "hrpf" | "pakistan";
}

/** Browser-selected motion and format variants; no animation JavaScript. */
export default function HeaderFlag({ flag }: HeaderFlagProps) {
  const base = `/images/header-flags/v1/${flag}`;

  return (
    <picture
      className={`hrpf-header-flag hrpf-header-flag-${flag} notranslate`}
      translate="no"
    >
      <source
        media="(prefers-reduced-motion: reduce)"
        srcSet={`${base}-still.png`}
      />
      <source
        type="image/webp"
        srcSet={`${base}-waving-small.webp 150w, ${base}-waving.webp 300w`}
        sizes="(min-width: 1280px) 64px, 44px"
      />
      {/* Keep the animated asset intact. The picture element selects one file,
          including the still PNG before loading if reduced motion is enabled. */}
      <Image
        src={`${base}-waving.gif`}
        alt=""
        width={300}
        height={200}
        unoptimized
        loading="eager"
        decoding="async"
        className="block h-auto w-full object-contain"
      />
    </picture>
  );
}
