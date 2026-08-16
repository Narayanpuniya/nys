import QRCode from "qrcode";

// QR code को data-URL (PNG) के रूप में बनाता है — ID card/certificate में embed हेतु।
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
    color: { dark: "#2a1a12", light: "#ffffff" },
  });
}

export function siteUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}${path}`;
}
