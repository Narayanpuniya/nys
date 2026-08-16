// Brand/social icons as inline SVG (lucide 1.x से brand icons हटा दिए गए हैं)।
import * as React from "react";

type P = React.SVGProps<SVGSVGElement>;

export function FacebookIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function InstagramIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M23 12s0-3.2-.4-4.73a2.5 2.5 0 0 0-1.76-1.77C19.32 5.1 12 5.1 12 5.1s-7.32 0-8.84.4A2.5 2.5 0 0 0 1.4 7.27C1 8.8 1 12 1 12s0 3.2.4 4.73a2.5 2.5 0 0 0 1.76 1.77c1.52.4 8.84.4 8.84.4s7.32 0 8.84-.4a2.5 2.5 0 0 0 1.76-1.77C23 15.2 23 12 23 12ZM9.75 15.02v-6.04L15.5 12l-5.75 3.02Z" />
    </svg>
  );
}

export function WhatsappIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.46 15.06L2 22l5.06-1.33A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 6.9 12.36l-.2.32.86 3.14-3.22-.85-.31.18A8.1 8.1 0 1 1 12.04 3.8Zm-3.1 4.02c-.15 0-.4.06-.6.29-.21.23-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.12.15 1.6 2.55 3.95 3.48 1.95.77 2.35.62 2.77.58.42-.04 1.37-.56 1.56-1.1.2-.54.2-1 .14-1.1-.06-.1-.21-.15-.44-.27-.23-.11-1.37-.68-1.58-.76-.21-.08-.37-.11-.52.12-.15.23-.6.76-.73.91-.14.15-.27.17-.5.06-.23-.12-.97-.36-1.85-1.14-.68-.6-1.14-1.35-1.28-1.58-.13-.23-.01-.35.1-.47.1-.1.23-.27.34-.4.11-.14.15-.23.23-.38.08-.15.04-.29-.02-.4-.06-.12-.52-1.27-.72-1.73-.19-.46-.38-.4-.52-.4l-.44-.01Z" />
    </svg>
  );
}

export function XIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M18.24 2H21l-6.44 7.36L22 22h-6.09l-4.77-6.24L5.6 22H2.84l6.9-7.88L2 2h6.24l4.31 5.7L18.24 2Zm-1.07 18h1.68L7.02 3.9H5.22L17.17 20Z" />
    </svg>
  );
}
