# NYS — नारायणपुरी यूथ सोसाइटी, गुदियाल नगर

**Shri Narayanpuri Youth Society (NYS), Gundiyal Nagar** का आधिकारिक डिजिटल प्लेटफॉर्म —
एक पूर्ण **Society Management System** (Public Website + Secure Admin Dashboard)।

> पंजीकरण: COOP/2023/JODHPUR/203833 · राजस्थान सोसाइटीज़ रजिस्ट्रेशन एक्ट, 1958
> (यह जानकारी public site पर तभी दिखती है जब Admin → Settings में enable करें।)

---

## 1. तकनीक (Tech Stack)

| परत | तकनीक |
|------|--------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (राजस्थानी saffron/maroon theme, Hindi-first) |
| Backend | Next.js Server Actions + Route Handlers |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT session (jose), httpOnly cookie, Role-Based Access Control |
| Payments | Razorpay (server-side verification; keys न हों तो Mock mode) |
| Files | QR (qrcode), Excel export (exceljs), print-friendly PDF pages |
| Charts | Recharts |

Architecture ऐसा है कि आगे **Android/iPhone App** इसी database व API पर बन सके।

---

## 2. फोल्डर संरचना (Architecture)

```
prisma/
  schema.prisma        # पूरा database schema (30+ models)
  seed.ts              # demo data (सदस्य, दान, अभियान, पोस्ट, कार्यक्रम)
src/
  app/
    (public)/          # सार्वजनिक वेबसाइट (home, about, activities, events,
                       #   campaigns, team, mentors, partners, gallery,
                       #   transparency, donate, join, contact, verify)
    admin/             # सुरक्षित Admin Dashboard + सभी CRUD modules
    api/               # REST endpoints (members, donations, events, posts,
                       #   suggestions, volunteers, contact, admin/export)
    certificate/ id-card/ receipt/   # QR-verifiable, print-friendly दस्तावेज़
  components/
    public/  admin/  ui/             # पुन: प्रयोज्य (reusable) components
  lib/
    db.ts              # Prisma client singleton
    auth.ts            # login/session/RBAC helpers
    constants.ts       # roles, permissions, categories, statuses
    settings.ts        # संस्था settings (DB में JSON blob)
    sequence.ts        # ID/receipt/certificate numbering
    payments.ts        # Razorpay + mock mode
    stats.ts campaigns.ts excel.ts qr.ts validation.ts audit.ts
  config/nav.ts        # public nav + admin sidebar (permission-aware)
  middleware.ts        # /admin व /api/admin routes की सुरक्षा
```

---

## 3. सेटअप (Local Setup)

### आवश्यकताएँ
- Node.js 20+ (परीक्षित: v24)
- PostgreSQL 14+ (परीक्षित: 17)

### चरण
```bash
# 1. dependencies install करें
npm install

# 2. environment सेट करें
cp .env.example .env
#   .env में DATABASE_URL व AUTH_SECRET भरें

# 3. database schema बनाएं
npm run db:push

# 4. demo data भरें (optional लेकिन अनुशंसित)
npm run db:seed

# 5. dev server चलाएं
npm run dev
```
अब खोलें: <http://localhost:3000>

### उपयोगी scripts
| कमांड | कार्य |
|-------|-------|
| `npm run dev` | development server |
| `npm run build` | production build |
| `npm run start` | production server |
| `npm run db:push` | schema → database |
| `npm run db:seed` | demo data |
| `npm run db:studio` | Prisma Studio (database GUI) |

---

## 4. Admin Login

```
URL:      /admin/login
Email:    admin@nys.org
Password: Admin@123
```
(seed से बने अन्य role accounts: `president@`, `secretary@`, `treasurer@` — वही password)

> **Production में सबसे पहले password बदलें** (Admin → Settings/Users) और
> `SEED_ADMIN_PASSWORD` तथा `AUTH_SECRET` को मज़बूत बनाएं।

### भूमिकाएँ (Roles / RBAC)
Super Admin · अध्यक्ष (President) · सचिव (Secretary) · कोषाध्यक्ष (Treasurer) ·
Content Manager · Event Manager — हर role की granular permissions `src/lib/constants.ts` में।

---

## 5. मुख्य विशेषताएँ (Features)

**Public:** Hero + live impact counters, गतिविधि पोस्ट (inner-scroll/pagination),
कार्यक्रम + registration, crowdfunding अभियान (live progress), टीम/मार्गदर्शक/सहयोगी,
गैलरी, पारदर्शिता पेज, सदस्यता (₹100 मासिक / ₹1200 वार्षिक), दान, QR verification।

**Admin:** Dashboard, सदस्य प्रबंधन + approval, ₹100/₹1200 का हिसाब, दान व donor dashboard,
अभियान + updates, वित्त (आय/व्यय + reports), पोस्ट/कार्यक्रम/गैलरी CMS, सुझाव, स्वयंसेवक,
Excel export, audit log, settings, admin users।

**Auto-generated:** Member ID (NYS-M-2026-00001), Digital ID Card (QR),
Membership Certificate, Donation Receipt (DON-…), Membership Receipt (MEM-…) — सभी
print/PDF-friendly व QR से सार्वजनिक रूप से verify करने योग्य।

---

## 6. Payments (Razorpay)

- `.env` में `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` **खाली** → **Mock mode**
  (dev में सदस्यता/दान का पूरा flow असली पैसे बिना टेस्ट करें)।
- keys भरने पर **live**। Payment verification हमेशा **server-side signature** से होता है —
  frontend के भरोसे payment success कभी नहीं माना जाता।
- Admin को देना होगा: Razorpay Key ID + Key Secret (Dashboard → Settings → API Keys)।

---

## 7. Deployment

1. एक managed PostgreSQL लें (Neon/Supabase/RDS) → `DATABASE_URL` सेट करें।
2. Host करें (Vercel/किसी Node host पर): `npm run build` फिर `npm run start`।
3. Production env: `AUTH_SECRET` (मज़बूत), `NEXT_PUBLIC_SITE_URL` (असली domain),
   Razorpay keys, (optional) Facebook token।
4. पहली बार: `npm run db:push` (या migrations) चलाएं; चाहें तो seed skip करें।

---

## 8. भविष्य (Roadmap)

Member Login Portal · WhatsApp/Push notifications · Android/iPhone App (इसी API पर) ·
Facebook feed integration · "Ask NYS" AI Assistant · Online voting · Digital attendance ·
Cloud object storage (S3) अपलोड्स के लिए · Email (SMTP) receipts/reminders।

---

## 9. सुरक्षा नोट्स

- Passwords bcrypt से hashed; sessions httpOnly JWT cookie में।
- `/admin` व `/api/admin` middleware से सुरक्षित; page-level granular permission checks।
- वित्तीय records delete नहीं — VOID/CANCELLED/REVERSED status (audit-safe)।
- सदस्य/donor की निजी जानकारी default रूप से public नहीं (privacy settings)।
- `.env` कभी commit न करें (`.gitignore` में शामिल)।
```
