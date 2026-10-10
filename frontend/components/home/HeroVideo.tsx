"use client";

import { useEffect, useRef } from "react";
import AppImage from "@/components/shared/AppImage";

const base = "/videos/home-banner/v1";

function sourceForScreen() {
  return `${base}/${window.matchMedia("(max-width: 767px)").matches ? "banner-mobile" : "banner"}.mp4`;
}

/** Decorative background: no audio or controls, with a still fallback. */
export default function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection;
    const updatePlayback = () => {
      if (motion.matches || connection?.saveData) {
        player.pause();
        player.removeAttribute("src");
        player.load();
      } else {
        player.src = sourceForScreen();
        void player.play().catch(() => { /* Keep the poster if autoplay is blocked. */ });
      }
    };
    updatePlayback();
    motion.addEventListener("change", updatePlayback);
    return () => {
      motion.removeEventListener("change", updatePlayback);
      player.pause();
      player.removeAttribute("src");
      player.load();
    };
  }, []);

  return (
      <div className="absolute inset-0" aria-hidden="true">
        <AppImage
          src={`${base}/poster.webp`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          poster={`${base}/poster.webp`}
          width={1280}
          height={720}
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => {
            video.current?.removeAttribute("src");
            video.current?.load();
          }}
        />
      </div>
  );
}
