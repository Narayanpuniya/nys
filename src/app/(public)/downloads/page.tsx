import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { DownloadsClient } from "./DownloadsClient";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.downloads_title };
}

export default async function DownloadsPage() {
  const { dict } = await getI18n();
  return <DownloadsClient dict={dict} />;
}
