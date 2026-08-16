import { z } from "zod";

const mobile = z
  .string()
  .trim()
  .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, "मान्य मोबाइल नंबर दर्ज करें");

export const memberSchema = z.object({
  fullName: z.string().trim().min(2, "नाम आवश्यक है"),
  guardianName: z.string().trim().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  mobile,
  whatsapp: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("मान्य ईमेल दर्ज करें").optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  village: z.string().trim().optional().or(z.literal("")),
  district: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  occupation: z.string().trim().optional().or(z.literal("")),
  bloodGroup: z.string().trim().optional().or(z.literal("")),
  photoUrl: z.string().trim().optional().or(z.literal("")),
  emergencyContact: z.string().trim().optional().or(z.literal("")),
  planId: z.string().min(1, "सदस्यता योजना चुनें"),
  consent: z.union([z.boolean(), z.string()]).refine((v: boolean | string) => v === true || v === "true" || v === "on", {
    message: "सहमति आवश्यक है",
  }),
});
export type MemberInput = z.infer<typeof memberSchema>;

export const donationSchema = z.object({
  donorName: z.string().trim().min(2, "नाम आवश्यक है"),
  mobile: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || "")
    .refine((v) => v === "" || /^(\+91[- ]?)?[6-9]\d{9}$/.test(v), "मान्य मोबाइल नंबर दर्ज करें"),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || "")
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "मान्य ईमेल दर्ज करें"),
  amount: z.coerce.number().int().min(10, "न्यूनतम ₹10"),
  purpose: z.string().default("GENERAL"),
  campaignId: z.string().optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  isAnonymous: z.coerce.boolean().optional(),
});
export type DonationInput = z.infer<typeof donationSchema>;

export const eventRegSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().trim().min(2, "नाम आवश्यक है"),
  mobile,
  email: z.string().trim().email().optional().or(z.literal("")),
  memberCode: z.string().trim().optional().or(z.literal("")),
  participants: z.coerce.number().int().min(1).max(50).default(1),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "नाम आवश्यक है"),
  mobile: mobile.optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().min(5, "संदेश आवश्यक है").max(2000),
  // honeypot spam protection
  website: z.string().max(0).optional().or(z.literal("")),
});

export const suggestionSchema = z.object({
  name: z.string().trim().min(2),
  subject: z.string().trim().min(2),
  category: z.string().default("SUGGESTION"),
  body: z.string().trim().min(5, "विवरण आवश्यक है"),
  memberCode: z.string().trim().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().email("मान्य ईमेल दर्ज करें"),
  password: z.string().min(1, "पासवर्ड आवश्यक है"),
});
