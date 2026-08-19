// ऊपर का maroon info strip — address, phone, email, reg number
import { MapPin, Phone, Mail } from "lucide-react";
import type { OrgSettings } from "@/lib/settings";

export function TopBar({ s }: { s: OrgSettings }) {
  return (
    <div
      className="hidden w-full lg:block"
      style={{ background: "linear-gradient(90deg, #7f1d1d 0%, #991b1b 100%)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-1.5">
        {/* Left — address */}
        <div className="flex items-center gap-1.5 text-xs text-red-100">
          <MapPin className="h-3 w-3 shrink-0 text-orange-300" />
          <span>{s.address}</span>
          {s.legal?.registrationNo && (
            <>
              <span className="mx-2 text-red-400">|</span>
              <span className="font-medium text-orange-200">
                Reg. No.: {s.legal.registrationNo}
              </span>
            </>
          )}
        </div>

        {/* Right — phone + email */}
        <div className="flex items-center gap-4 text-xs text-red-100">
          {s.mobile && (
            <a
              href={`tel:${s.mobile}`}
              className="flex items-center gap-1 transition hover:text-orange-200"
            >
              <Phone className="h-3 w-3 text-orange-300" />
              {s.mobile}
            </a>
          )}
          {s.email && (
            <a
              href={`mailto:${s.email}`}
              className="flex items-center gap-1 transition hover:text-orange-200"
            >
              <Mail className="h-3 w-3 text-orange-300" />
              {s.email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
