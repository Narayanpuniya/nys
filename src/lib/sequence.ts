import { prisma } from "./db";

// Sequence generator — interactive $transaction से बचते हैं (Neon pooler / PgBouncer
// पर interactive transactions अक्सर fail होते हैं)। Optimistic lock से atomic increment।

export async function nextSequence(scope: string, padWidth = 5): Promise<number> {
  const key = `seq:${scope}`;
  for (let attempt = 0; attempt < 12; attempt++) {
    const existing = await prisma.setting.findUnique({ where: { key } });
    const current = existing ? parseInt(existing.value, 10) || 0 : 0;
    const next = current + 1;
    if (!existing) {
      try {
        await prisma.setting.create({ data: { key, value: String(next) } });
        return next;
      } catch {
        continue;
      }
    }
    const result = await prisma.setting.updateMany({
      where: { key, value: existing.value },
      data: { value: String(next) },
    });
    if (result.count === 1) return next;
  }
  void padWidth;
  throw new Error(`sequence unavailable: ${scope}`);
}

/** Counter को कम से कम `minValue` तक पहुँचाएँ (seed के बाद sync के लिए)। */
async function ensureSequenceAtLeast(scope: string, minValue: number): Promise<void> {
  if (minValue <= 0) return;
  const key = `seq:${scope}`;
  const existing = await prisma.setting.findUnique({ where: { key } });
  const current = existing ? parseInt(existing.value, 10) || 0 : 0;
  if (current >= minValue) return;
  if (!existing) {
    try {
      await prisma.setting.create({ data: { key, value: String(minValue) } });
    } catch {
      // race — ignore
    }
    return;
  }
  await prisma.setting.updateMany({
    where: { key, value: existing.value },
    data: { value: String(minValue) },
  });
}

function pad(n: number, width = 5): string {
  return String(n).padStart(width, "0");
}

const YEAR = () => new Date().getFullYear();

/** Seed ने जो codes बनाए हों, उनसे आगे का अगला नंबर निकालें। */
async function maxSuffixForPrefix(prefix: string, year: number): Promise<number> {
  const pattern = `${prefix}-${year}-`;
  const rows = await prisma.member.findMany({
    where: { memberCode: { startsWith: pattern } },
    select: { memberCode: true },
  });
  let max = 0;
  for (const r of rows) {
    const part = r.memberCode.slice(pattern.length);
    const n = parseInt(part, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max;
}

export async function generateMemberCode(prefix = "NYS-M"): Promise<string> {
  const y = YEAR();
  const scope = `MEMBER:${y}`;
  const maxExisting = await maxSuffixForPrefix(prefix, y);
  await ensureSequenceAtLeast(scope, maxExisting);

  for (let i = 0; i < 30; i++) {
    const n = await nextSequence(scope);
    const code = `${prefix}-${y}-${pad(n)}`;
    const exists = await prisma.member.findUnique({
      where: { memberCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  // अंतिम fallback — unique रहता है
  const n = await nextSequence(scope);
  return `${prefix}-${y}-${pad(n)}-${Date.now().toString(36).slice(-4)}`;
}

export async function generateDonationReceipt(prefix = "DON"): Promise<string> {
  const y = YEAR();
  const n = await nextSequence(`DON:${y}`);
  return `${prefix}-${y}-${pad(n)}`;
}

export async function generateMembershipReceipt(prefix = "MEM"): Promise<string> {
  const y = YEAR();
  const scope = `MEM:${y}`;
  // मौजूदा रसीदों से sync
  const pattern = `${prefix}-${y}-`;
  const rows = await prisma.membershipPayment.findMany({
    where: { receiptNumber: { startsWith: pattern } },
    select: { receiptNumber: true },
  });
  let max = 0;
  for (const r of rows) {
    const part = r.receiptNumber.slice(pattern.length);
    const n = parseInt(part, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  await ensureSequenceAtLeast(scope, max);

  for (let i = 0; i < 20; i++) {
    const n = await nextSequence(scope);
    const code = `${prefix}-${y}-${pad(n)}`;
    const exists = await prisma.membershipPayment.findUnique({
      where: { receiptNumber: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  const n = await nextSequence(scope);
  return `${prefix}-${y}-${pad(n)}-${Date.now().toString(36).slice(-4)}`;
}

export async function generateEventReg(prefix = "EVT"): Promise<string> {
  const y = YEAR();
  const n = await nextSequence(`EVT:${y}`);
  return `${prefix}-${y}-${pad(n)}`;
}

export async function generateCertNumber(prefix = "NYS-CERT"): Promise<string> {
  const y = YEAR();
  const n = await nextSequence(`CERT:${y}`);
  return `${prefix}-${y}-${pad(n)}`;
}

export async function generateTxnCode(kind: "INC" | "EXP"): Promise<string> {
  const y = YEAR();
  const n = await nextSequence(`${kind}:${y}`);
  return `${kind}-${y}-${pad(n, 6)}`;
}
