import { prisma } from "./db";

// Atomic-ish sequence generator। Setting table में counter रखते हैं और
// transaction में increment करते हैं ताकि duplicate identifiers न बनें।
// Format उदाहरण: NYS-M-2026-00001, DON-2026-00001

export async function nextSequence(scope: string, pad = 5): Promise<number> {
  const key = `seq:${scope}`;
  const seq = await prisma.$transaction(async (tx) => {
    const existing = await tx.setting.findUnique({ where: { key } });
    const current = existing ? parseInt(existing.value, 10) || 0 : 0;
    const next = current + 1;
    await tx.setting.upsert({
      where: { key },
      update: { value: String(next) },
      create: { key, value: String(next) },
    });
    return next;
  });
  void pad;
  return seq;
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
