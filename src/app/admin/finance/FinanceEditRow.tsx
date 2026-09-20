"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateIncome, updateExpense } from "./actions";

const EXPENSE_CATS = ["Education", "Sports", "Environment", "Craft & Heritage", "Social Service", "Events", "Office", "Travel", "Equipment", "Other"];
const INCOME_CATS = ["Membership", "Donation", "Grant", "Sponsorship", "Event", "Other"];
const INCOME_SRCS = ["MEMBERSHIP", "DONATION", "GRANT", "SPONSORSHIP", "EVENT", "OTHER"];
const MODES = ["CASH", "UPI", "BANK", "CHEQUE"];

const field =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-saffron-500";

export type FinanceRow = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  source: string | null;
  mode: string;
  date: string;   // yyyy-mm-dd
  txnCode: string;
};

export function FinanceEditRow({ row }: { row: FinanceRow }) {
  const [open, setOpen] = useState(false);
  const isIncome = row.type === "income";
  const cats = isIncome ? INCOME_CATS : EXPENSE_CATS;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="बदलें"
        className="ml-1 rounded p-1 text-blue-600 hover:bg-blue-50"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
              <h3 className="font-bold text-ink">
                {isIncome ? "आय बदलें" : "व्यय बदलें"}
                <span className="ml-2 text-xs font-normal text-stone-400">{row.txnCode}</span>
              </h3>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              action={isIncome ? updateIncome : updateExpense}
              encType="multipart/form-data"
              onSubmit={() => setOpen(false)}
              className="space-y-3 p-5"
            >
              <input type="hidden" name="id" value={row.id} />

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">राशि ₹ *</span>
                  <input name="amount" type="number" min="1" required defaultValue={row.amount} className={`mt-1 ${field}`} />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">तारीख़ *</span>
                  <input name="date" type="date" required defaultValue={row.date} className={`mt-1 ${field}`} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">श्रेणी</span>
                  <select name="category" defaultValue={row.category} className={`mt-1 ${field}`}>
                    {cats.map((c) => <option key={c}>{c}</option>)}
                    {!cats.includes(row.category) && <option>{row.category}</option>}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">तरीका</span>
                  <select name="mode" defaultValue={row.mode} className={`mt-1 ${field}`}>
                    {MODES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
              </div>

              {isIncome && (
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">स्रोत</span>
                  <select name="source" defaultValue={row.source ?? "OTHER"} className={`mt-1 ${field}`}>
                    {INCOME_SRCS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              )}

              <label className="block">
                <span className="text-xs font-bold text-stone-600">विवरण</span>
                <input name="description" defaultValue={row.description ?? ""} className={`mt-1 ${field}`} />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-stone-600">नया बिल / रसीद (बदलना हो तो)</span>
                <input name="bill" type="file" accept="image/*,application/pdf"
                  className="mt-1 w-full text-xs text-stone-500 file:mr-2 file:rounded-lg file:border file:border-stone-300 file:bg-stone-50 file:px-2 file:py-1 file:text-xs file:font-medium" />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-100">
                  रद्द
                </button>
                <button type="submit"
                  className="rounded-lg bg-saffron-600 px-5 py-2 text-sm font-bold text-white hover:bg-saffron-700">
                  सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
