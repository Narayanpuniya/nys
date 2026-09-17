import type { MetadataRoute } from "next";
import { ANDROID_PACKAGE_ID, PLAY_STORE_URL } from "@/lib/constants";

// PWA / TWA manifest — Android app (Play Store) इसी को पढ़ता है
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "श्री नारायणपुरी यूथ सोसाइटी (NYS)",
    short_name: "NYS",
    description:
      "शिक्षा, खेल, पर्यावरण और विरासत के माध्यम से समाज एवं युवाओं के विकास की ओर एक कदम।",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "hi",
    dir: "ltr",
    theme_color: "#7f1d1d",
    background_color: "#ffffff",
    categories: ["education", "social", "lifestyle"],
    // Chrome को बताता है कि Play Store पर native app है (install prompt वहीं ले जाएगा)
    prefer_related_applications: true,
    related_applications: [{ platform: "play", url: PLAY_STORE_URL, id: ANDROID_PACKAGE_ID }],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "दान करें", short_name: "दान", url: "/donate", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "NYS से जुड़ें", short_name: "जुड़ें", url: "/join", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "गतिविधियाँ", short_name: "गतिविधियाँ", url: "/activities", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "संपर्क", short_name: "संपर्क", url: "/contact", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
