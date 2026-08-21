"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, Loader2, X, Plus, Check } from "lucide-react";

type MemberData = {
  id: string;
  fullName: string;
  mobile: string;
  photoUrl: string | null;
  occupation: string | null;
};

type Linked = {
  teamMembers: { id: string; designation: string }[];
  mentors: { id: string; designation: string | null; profession: string | null }[];
};

const DESIGNATION_KEYS = ["PRESIDENT","VICE_PRESIDENT","SECRETARY","JOINT_SECRETARY","TREASURER","EXECUTIVE_MEMBER","MEMBER"];
const DESIGNATION_LABELS: Record<string,string> = {
  PRESIDENT: "अध्यक्ष", VICE_PRESIDENT: "उपाध्यक्ष", SECRETARY: "सचिव",
  JOINT_SECRETARY: "सह-सचिव", TREASURER: "कोषाध्यक्ष",
  EXECUTIVE_MEMBER: "कार्यकारिणी सदस्य", MEMBER: "सदस्य",
};

const inp = "w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 outline-none focus:border-saffron-400 focus:bg-white focus:ring-2 focus:ring-saffron-100";

export function AddToTeamMentor({ member, linked }: { member: MemberData; linked: Linked }) {
  const router = useRouter();
  const [modal, setModal] = useState<"team" | "mentor" | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Team form state
  const [teamForm, setTeamForm] = useState({
    designation: "",
    designationKey: "MEMBER",
    responsibility: "",
    isLeadership: false,
    showMobile: false,
    sortOrder: 0,
  });

  // Mentor form state
  const [mentorForm, setMentorForm] = useState({
    designation: "",
    profession: member.occupation ?? "",
    intro: "",
    featured: false,
    showContact: false,
    sortOrder: 0,
  });

  function openTeam() { setModal("team"); setError(""); setDone(false); }
  function openMentor() { setModal("mentor"); setError(""); setDone(false); }
  function close() { setModal(null); setDone(false); }

  async function saveTeam() {
    setSaving(true); setError("");
    const fd = new FormData();
    fd.set("name", member.fullName);
    fd.set("designation", teamForm.designation);
    fd.set("designationKey", teamForm.designationKey);
    fd.set("mobile", member.mobile);
    fd.set("responsibility", teamForm.responsibility);
    fd.set("isLeadership", String(teamForm.isLeadership));
    fd.set("showMobile", String(teamForm.showMobile));
    fd.set("sortOrder", String(teamForm.sortOrder));
    fd.set("memberId", member.id);
    // If member has a photo URL, pass it so it gets saved
    if (member.photoUrl) fd.set("photoUrl", member.photoUrl);

    const res = await fetch("/api/admin/team", { method: "POST", body: fd });
    setSaving(false);
    if (!res.ok) { setError("सहेजने में त्रुटि।"); return; }
    setDone(true);
    router.refresh();
    setTimeout(close, 1500);
  }

  async function saveMentor() {
    setSaving(true); setError("");
    const fd = new FormData();
    fd.set("name", member.fullName);
    fd.set("designation", mentorForm.designation);
    fd.set("profession", mentorForm.profession);
    fd.set("contact", member.mobile);
    fd.set("intro", mentorForm.intro);
    fd.set("featured", String(mentorForm.featured));
    fd.set("showContact", String(mentorForm.showContact));
    fd.set("sortOrder", String(mentorForm.sortOrder));
    fd.set("memberId", member.id);
    if (member.photoUrl) fd.set("photoUrl", member.photoUrl);

    const res = await fetch("/api/admin/mentors", { method: "POST", body: fd });
    setSaving(false);
    if (!res.ok) { setError("सहेजने में त्रुटि।"); return; }
    setDone(true);
    router.refresh();
    setTimeout(close, 1500);
  }

  const alreadyTeam = linked.teamMembers.length > 0;
  const alreadyMentor = linked.mentors.length > 0;

  return (
    <>
      {/* Compact action buttons */}
      <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
        <p className="mb-3 text-xs font-bold text-stone-500 uppercase tracking-wide">भूमिका असाइन करें</p>
        <div className="flex flex-col gap-2">

          {/* Team button */}
          {alreadyTeam ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" />
              टीम में जोड़ा गया — {linked.teamMembers.map(t => t.designation).join(", ")}
            </div>
          ) : (
            <button
              onClick={openTeam}
              className="flex items-center gap-2 rounded-xl border border-saffron-300 bg-saffron-50 px-4 py-2.5 text-sm font-semibold text-saffron-800 hover:bg-saffron-100"
            >
              <Users className="h-4 w-4" />
              <Plus className="h-3.5 w-3.5 -ml-1" />
              टीम सदस्य बनाएं
            </button>
          )}

          {/* Mentor button */}
          {alreadyMentor ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" />
              मार्गदर्शक के रूप में जोड़ा गया
            </div>
          ) : (
            <button
              onClick={openMentor}
              className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
            >
              <GraduationCap className="h-4 w-4" />
              <Plus className="h-3.5 w-3.5 -ml-1" />
              मार्गदर्शक बनाएं
            </button>
          )}
        </div>
      </div>

      {/* ── Team Modal ── */}
      {modal === "team" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && close()}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {member.photoUrl && <img src={member.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />}
                <div>
                  <h3 className="font-bold text-stone-800">टीम सदस्य बनाएं</h3>
                  <p className="text-xs text-stone-400">{member.fullName} · {member.mobile}</p>
                </div>
              </div>
              <button onClick={close}><X className="h-5 w-5 text-stone-400" /></button>
            </div>

            {done ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-6 text-green-700">
                <Check className="h-5 w-5" /> टीम में सफलतापूर्वक जोड़ा गया!
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">पद (Designation) *</label>
                  <input value={teamForm.designation} onChange={e => setTeamForm(f => ({ ...f, designation: e.target.value }))} placeholder="जैसे: अध्यक्ष" className={inp} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">पद श्रेणी</label>
                  <select value={teamForm.designationKey} onChange={e => setTeamForm(f => ({ ...f, designationKey: e.target.value }))} className={inp}>
                    {DESIGNATION_KEYS.map(k => <option key={k} value={k}>{DESIGNATION_LABELS[k]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">जिम्मेदारी</label>
                  <input value={teamForm.responsibility} onChange={e => setTeamForm(f => ({ ...f, responsibility: e.target.value }))} placeholder="जैसे: शिक्षा विभाग" className={inp} />
                </div>
                <div className="flex gap-4 text-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={teamForm.isLeadership} onChange={e => setTeamForm(f => ({ ...f, isLeadership: e.target.checked }))} />
                    नेतृत्व टीम
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={teamForm.showMobile} onChange={e => setTeamForm(f => ({ ...f, showMobile: e.target.checked }))} />
                    मोबाइल दिखाएं
                  </label>
                </div>
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">⚠️ {error}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={close} className="rounded-lg border border-stone-200 px-4 py-2 text-sm">रद्द करें</button>
                  <button onClick={saveTeam} disabled={saving || !teamForm.designation.trim()}
                    className="flex items-center gap-2 rounded-lg bg-saffron-600 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-700 disabled:opacity-60">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />} टीम में जोड़ें
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mentor Modal ── */}
      {modal === "mentor" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && close()}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {member.photoUrl && <img src={member.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />}
                <div>
                  <h3 className="font-bold text-stone-800">मार्गदर्शक बनाएं</h3>
                  <p className="text-xs text-stone-400">{member.fullName} · {member.mobile}</p>
                </div>
              </div>
              <button onClick={close}><X className="h-5 w-5 text-stone-400" /></button>
            </div>

            {done ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-6 text-green-700">
                <Check className="h-5 w-5" /> मार्गदर्शक के रूप में सफलतापूर्वक जोड़ा गया!
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">पदनाम</label>
                  <input value={mentorForm.designation} onChange={e => setMentorForm(f => ({ ...f, designation: e.target.value }))} placeholder="जैसे: शिक्षाविद्, समाजसेवक" className={inp} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">पेशा</label>
                  <input value={mentorForm.profession} onChange={e => setMentorForm(f => ({ ...f, profession: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">परिचय</label>
                  <textarea rows={2} value={mentorForm.intro} onChange={e => setMentorForm(f => ({ ...f, intro: e.target.value }))} placeholder="संक्षिप्त परिचय…" className={inp} />
                </div>
                <div className="flex gap-4 text-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={mentorForm.featured} onChange={e => setMentorForm(f => ({ ...f, featured: e.target.checked }))} />
                    विशेष (Featured)
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={mentorForm.showContact} onChange={e => setMentorForm(f => ({ ...f, showContact: e.target.checked }))} />
                    संपर्क दिखाएं
                  </label>
                </div>
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">⚠️ {error}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={close} className="rounded-lg border border-stone-200 px-4 py-2 text-sm">रद्द करें</button>
                  <button onClick={saveMentor} disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />} मार्गदर्शक बनाएं
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
