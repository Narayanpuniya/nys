import { prisma } from "./db";

// Sequence generator — interactive $transaction से बचते हैं (Neon pooler / PgBouncer
// पर interactive transactions अक्सर fail होते हैं)। Optimistic lock से atomic increment।

export async function nextSequence(scope: string, padWidth = 5): Promise<number> {
  const key = `seq:${scope}`;
  for (let attempt = 0; attempt < 8; attempt++) {
    const existing = await prisma.setting.findUnique({ where: { key } });
    const current = existing ? parseInt(existing.value, 10) || 0 : 0;
    const next = current + 1;
    if (!existing) {
      try {
        await prisma.setting.create({ data: { key, value: String(next) } });
        return next;
      } catch {
        continue; // race — retry
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

function pad(n: number, width = 5): string {
  return String(n).padStart(width, "0");
}

const YEAR = () => new Date().getFullYear();

export async function generateMemberCode(prefix = "NYS-M"): Promise<string> {
  const y = YEAR();
  const n = await nextSequence(`MEMBER:${y}`);
  return `${prefix}-${y}-${pad(n)}`;
}

export async function generateDonationReceipt(prefix = "DON"): Promise<string> {
  const y = YEAR();
  const n = await nextSequence(`DON:${y}`);
  return `${prefix}-${y}-${pad(n)}`;
}

export async function generateMembershipReceipt(prefix = "MEM"): Promise<string> {
  const y = YEAR();
  const n = await nextSequence(`MEM:${y}`);
  return `${prefix}-${y}-${pad(n)}`;
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
