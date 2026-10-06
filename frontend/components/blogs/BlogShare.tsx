"use client";
import { useState } from "react";
import { Copy, Share2 } from "lucide-react";
export default function BlogShare({ title }: { title: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Link copied.");
    } catch {
      setMessage("Copy the page address from your browser to share this blog.");
    }
  }
  function share(service: "facebook" | "whatsapp" | "x") {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const target =
      service === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
        : service === "whatsapp"
          ? `https://wa.me/?text=${text}%20${url}`
          : `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(target, "_blank", "noopener,noreferrer");
  }
  return (
    <div className="border-y border-border py-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-navy">
        <Share2 size={16} aria-hidden="true" />
        Share this blog
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={() => void copy()}
          type="button"
          className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm hover:border-teal"
        >
          <Copy size={15} aria-hidden="true" />
          Copy link
        </button>
        {(["facebook", "whatsapp", "x"] as const).map((service) => (
          <button
            key={service}
            onClick={() => share(service)}
            type="button"
            className="border border-border px-3 py-2 text-sm hover:border-teal"
          >
            {service === "facebook"
              ? "Facebook"
              : service === "whatsapp"
                ? "WhatsApp"
                : "X"}
          </button>
        ))}
      </div>
      <p role="status" className="mt-2 text-xs text-teal-dark">
        {message}
      </p>
    </div>
  );
}
