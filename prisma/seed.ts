import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ACTIVITY_CATEGORIES, ROLES } from "../src/lib/constants";
import { DEFAULT_SETTINGS } from "../src/lib/settings";

const prisma = new PrismaClient();

function slugify(s: string) {
  const ascii = s
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || Math.random().toString(36).slice(2, 8);
}
const pad = (n: number, w = 5) => String(n).padStart(w, "0");
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000);

async function main() {
  console.log("🌱 NYS seed शुरू...");

  // ── Settings ──
  await prisma.setting.upsert({
    where: { key: "org" },
    update: {},
    create: { key: "org", value: JSON.stringify(DEFAULT_SETTINGS) },
  });

  // ── Admin users ──
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@nys.org";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "Admin@123";
  const hash = await bcrypt.hash(adminPass, 10);

  const users = [
    { name: "सुपर एडमिन", email: adminEmail, role: ROLES.SUPER_ADMIN },
    { name: "अध्यक्ष जी", email: "president@nys.org", role: ROLES.PRESIDENT },
    { name: "सचिव जी", email: "secretary@nys.org", role: ROLES.SECRETARY },
    { name: "कोषाध्यक्ष जी", email: "treasurer@nys.org", role: ROLES.TREASURER },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, name: u.name },
      create: { ...u, passwordHash: hash },
    });
  }
  const superAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  // ── Membership plans ──
  const monthly = await prisma.membershipPlan.upsert({
    where: { slug: "monthly" },
    update: {},
    create: { name: "मासिक सदस्यता", slug: "monthly", amount: 100, periodDays: 30, description: "₹100 प्रति माह", sortOrder: 1 },
  });
  const annual = await prisma.membershipPlan.upsert({
    where: { slug: "annual" },
    update: {},
    create: { name: "वार्षिक सदस्यता", slug: "annual", amount: 1200, periodDays: 365, description: "₹1,200 प्रति वर्ष", sortOrder: 2 },
  });

  // ── Categories ──
  const catMap: Record<string, string> = {};
  for (let i = 0; i < ACTIVITY_CATEGORIES.length; i++) {
    const c = ACTIVITY_CATEGORIES[i];
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, color: c.color, summary: c.summary, sortOrder: i },
      create: { slug: c.slug, name: c.name, icon: c.icon, color: c.color, summary: c.summary, sortOrder: i },
    });
    catMap[c.slug] = row.id;
  }

  // ── Team (leadership + members) ──
  const team = [
    { name: "श्री रमेश कुमार", designation: "अध्यक्ष", designationKey: "PRESIDENT", isLeadership: true, mobile: "+919000000001", showMobile: true, responsibility: "संस्था का समग्र नेतृत्व एवं दिशा-निर्देश", sortOrder: 1 },
    { name: "श्री महेश शर्मा", designation: "उपाध्यक्ष", designationKey: "VICE_PRESIDENT", sortOrder: 2 },
    { name: "श्री सुरेश मीणा", designation: "सचिव", designationKey: "SECRETARY", isLeadership: true, mobile: "+919000000002", showMobile: true, responsibility: "कार्यक्रम संचालन एवं सदस्य समन्वय", sortOrder: 3 },
    { name: "श्री दिनेश गुर्जर", designation: "सह-सचिव", designationKey: "JOINT_SECRETARY", sortOrder: 4 },
    { name: "श्री राकेश जैन", designation: "कोषाध्यक्ष", designationKey: "TREASURER", isLeadership: true, mobile: "+919000000003", showMobile: true, responsibility: "वित्तीय प्रबंधन एवं पारदर्शिता", sortOrder: 5 },
    { name: "श्रीमती सुनीता देवी", designation: "कार्यकारिणी सदस्य", designationKey: "MEMBER", sortOrder: 6 },
  ];
  for (const t of team) {
    const exists = await prisma.teamMember.findFirst({ where: { name: t.name } });
    if (!exists) await prisma.teamMember.create({ data: t });
  }

  // ── Mentors ──
  const mentors = [
    { name: "डॉ. के. एल. वर्मा", designation: "शिक्षाविद्", profession: "सेवानिवृत्त प्राचार्य", intro: "शिक्षा के क्षेत्र में 35 वर्षों का अनुभव।", contribution: "शैक्षिक कार्यक्रमों का मार्गदर्शन", featured: true, sortOrder: 1 },
    { name: "श्री अशोक पालीवाल", designation: "समाजसेवी", profession: "सामाजिक कार्यकर्ता", intro: "ग्रामीण विकास में सक्रिय योगदान।", contribution: "सामाजिक अभियानों का नेतृत्व", featured: true, sortOrder: 2 },
  ];
  for (const m of mentors) {
    const exists = await prisma.mentor.findFirst({ where: { name: m.name } });
    if (!exists) await prisma.mentor.create({ data: m });
  }

  // ── Partners ──
  const partners = [
    { slug: "gyan-jyoti", name: "ज्ञान ज्योति विद्यालय", about: "स्थानीय विद्यालय जो NYS के साथ शैक्षिक कार्यक्रम चलाता है।", contribution: "संयुक्त शैक्षिक शिविर", featured: true, programs: [{ title: "संयुक्त शिक्षा शिविर", impactLabel: "विद्यार्थी लाभान्वित", impactValue: 300 }, { title: "पर्यावरण अभियान", impactLabel: "पौधारोपण", impactValue: 200 }] },
    { slug: "hariyali-foundation", name: "हरियाली फाउंडेशन", about: "पर्यावरण संरक्षण हेतु समर्पित संस्था।", contribution: "वृक्षारोपण अभियान", featured: true, programs: [{ title: "वृक्षारोपण महाअभियान", impactLabel: "पेड़", impactValue: 500 }] },
  ];
  for (const p of partners) {
    const exists = await prisma.partner.findUnique({ where: { slug: p.slug } });
    if (!exists) {
      await prisma.partner.create({
        data: {
          slug: p.slug, name: p.name, about: p.about, contribution: p.contribution, featured: p.featured,
          programs: { create: p.programs },
        },
      });
    }
  }

  // ── Members (sample) ──
  const villages = ["गुदियाल नगर", "नारायणपुरी", "रामपुरा", "बालाजी नगर"];
  const memberIds: string[] = [];
  for (let i = 1; i <= 24; i++) {
    const code = `NYS-M-2026-${pad(i)}`;
    const isAnnual = i % 3 === 0;
    const plan = isAnnual ? annual : monthly;
    const existing = await prisma.member.findUnique({ where: { memberCode: code } });
    if (existing) { memberIds.push(existing.id); continue; }
    const m = await prisma.member.create({
      data: {
        memberCode: code,
        fullName: `सदस्य ${i} कुमार`,
        guardianName: `पिता ${i}`,
        mobile: `+9198${pad(i, 8)}`,
        village: villages[i % villages.length],
        district: "अजमेर",
        state: "Rajasthan",
        status: i <= 20 ? "ACTIVE" : "PENDING",
        planId: plan.id,
        joiningDate: daysFromNow(-i * 5),
        validUntil: daysFromNow(plan.periodDays - i * 5),
        consent: true,
        showMobile: false,
      },
    });
    memberIds.push(m.id);
  }
  console.log(`   ${memberIds.length} सदस्य`);

  // ── Membership payments + income ──
  let memSeq = 0;
  for (let i = 0; i < 20; i++) {
    const mId = memberIds[i];
    const member = await prisma.member.findUnique({ where: { id: mId }, include: { plan: true } });
    if (!member?.plan) continue;
    memSeq++;
    const rec = `MEM-2026-${pad(memSeq)}`;
    const exists = await prisma.membershipPayment.findUnique({ where: { receiptNumber: rec } });
    if (exists) continue;
    await prisma.membershipPayment.create({
      data: {
        receiptNumber: rec, memberId: mId, planId: member.planId, amount: member.plan.amount,
        periodStart: member.joiningDate, periodEnd: member.validUntil ?? daysFromNow(30),
        mode: i % 4 === 0 ? "CASH" : "ONLINE", status: "SUCCESS", paidAt: daysFromNow(-i * 4),
      },
    });
    await prisma.income.create({
      data: {
        txnCode: `INC-2026-${pad(memSeq, 6)}`, source: "MEMBERSHIP", category: member.plan.name,
        amount: member.plan.amount, description: `सदस्यता शुल्क — ${member.fullName}`,
        mode: i % 4 === 0 ? "CASH" : "ONLINE", refType: "MembershipPayment", date: daysFromNow(-i * 4),
        createdById: superAdmin?.id,
      },
    });
  }

  // ── Campaigns ──
  const campaigns = [
    { slug: "school-library-2026", title: "गांव में पुस्तकालय निर्माण", goalAmount: 200000, category: "EDUCATION", beneficiary: "ज्ञान ज्योति विद्यालय के 300 विद्यार्थी", location: "गुदियाल नगर", description: "बच्चों के लिए एक आधुनिक पुस्तकालय बनाने हेतु सहयोग करें। इसमें पुस्तकें, फर्नीचर और डिजिटल संसाधन शामिल होंगे।", status: "ACTIVE", featured: true, endDate: daysFromNow(60) },
    { slug: "green-narayanpuri", title: "हरित नारायणपुरी अभियान", goalAmount: 100000, category: "ENVIRONMENT", beneficiary: "संपूर्ण ग्राम", location: "नारायणपुरी", description: "5000 पेड़ लगाने और उनकी देखभाल के लिए अभियान।", status: "ACTIVE", featured: false, endDate: daysFromNow(90) },
  ];
  const campaignIds: Record<string, string> = {};
  for (const c of campaigns) {
    const row = await prisma.campaign.upsert({ where: { slug: c.slug }, update: {}, create: c });
    campaignIds[c.slug] = row.id;
    await prisma.campaignUpdate.create({
      data: { campaignId: row.id, title: "अभियान की शुरुआत", body: "हम आपके सहयोग के लिए आभारी हैं। कार्य प्रगति पर है।" },
    }).catch(() => {});
  }

  // ── Donations ──
  let donSeq = 0;
  const donorNames = ["राहुल", "प्रिया", "अमित", "नेहा", "विकास", "सीमा", "गुमनाम दानदाता"];
  for (let i = 0; i < 30; i++) {
    donSeq++;
    const rec = `DON-2026-${pad(donSeq)}`;
    const exists = await prisma.donation.findUnique({ where: { receiptNumber: rec } });
    if (exists) continue;
    const toCampaign = i % 2 === 0;
    const campId = toCampaign ? campaignIds["school-library-2026"] : null;
    const amount = [100, 500, 1000, 5000, 2100][i % 5];
    const name = donorNames[i % donorNames.length];
    await prisma.donation.create({
      data: {
        receiptNumber: rec, donorName: name, amount,
        purpose: toCampaign ? "CAMPAIGN" : "GENERAL", campaignId: campId,
        mode: "ONLINE", status: "SUCCESS", paidAt: daysFromNow(-i * 2),
        gatewayTxnId: `pay_seed_${i}`,
      },
    });
    await prisma.income.create({
      data: {
        txnCode: `INC-2026-${pad(1000 + donSeq, 6)}`, source: toCampaign ? "CROWDFUNDING" : "DONATION",
        category: toCampaign ? "अभियान दान" : "सामान्य दान", amount, description: `दान — ${name}`,
        mode: "ONLINE", refType: "Donation", date: daysFromNow(-i * 2), createdById: superAdmin?.id,
      },
    });
  }

  // ── Expenses ──
  const expenses = [
    { category: "Education", amount: 45000, description: "पुस्तकें एवं शैक्षिक सामग्री" },
    { category: "Environment", amount: 18000, description: "पौधे एवं वृक्षारोपण सामग्री" },
    { category: "Sports", amount: 22000, description: "खेल उपकरण" },
    { category: "Events", amount: 15000, description: "वार्षिक कार्यक्रम व्यय" },
    { category: "Office", amount: 8000, description: "कार्यालय व्यय" },
  ];
  for (let i = 0; i < expenses.length; i++) {
    const code = `EXP-2026-${pad(i + 1, 6)}`;
    const exists = await prisma.expense.findUnique({ where: { txnCode: code } });
    if (exists) continue;
    await prisma.expense.create({
      data: { ...expenses[i], txnCode: code, mode: "BANK", date: daysFromNow(-i * 10), createdById: superAdmin?.id },
    });
  }

  // ── Events ──
  const events = [
    { slug: "vriksharopan-2026", title: "वृक्षारोपण महाअभियान 2026", category: "ENVIRONMENT", description: "गांव में 500 पौधे लगाने का सामूहिक कार्यक्रम। सभी सदस्य एवं ग्रामवासी आमंत्रित हैं।", date: daysFromNow(15), time: "प्रातः 7:00", venue: "गुदियाल नगर मैदान", status: "UPCOMING", featured: true, registrationRequired: true, maxParticipants: 200, contactPerson: "सुरेश मीणा", contactNumber: "+919000000002" },
    { slug: "khel-mahotsav-2026", title: "युवा खेल महोत्सव", category: "SPORTS", description: "विभिन्न खेल प्रतियोगिताएं एवं पुरस्कार वितरण।", date: daysFromNow(30), time: "प्रातः 9:00", venue: "राजकीय विद्यालय मैदान", status: "UPCOMING", featured: false, registrationRequired: true, maxParticipants: 150 },
    { slug: "shiksha-shivir-2025", title: "निःशुल्क शिक्षा शिविर", category: "EDUCATION", description: "विद्यार्थियों के लिए मार्गदर्शन शिविर।", date: daysFromNow(-20), venue: "NYS कार्यालय", status: "COMPLETED", featured: false },
  ];
  for (const e of events) {
    await prisma.event.upsert({ where: { slug: e.slug }, update: {}, create: e });
  }

  // ── Posts (activities) — बहुत सारे, inner-scroll demo हेतु ──
  const postTemplates = [
    { cat: "shiksha", title: "विद्यार्थियों को शैक्षिक सामग्री वितरण", impact: 120, label: "विद्यार्थी" },
    { cat: "khel", title: "अंतर-विद्यालय खेल प्रतियोगिता", impact: 80, label: "प्रतिभागी" },
    { cat: "paryavaran", title: "सफाई अभियान एवं जागरूकता", impact: 150, label: "पौधे" },
    { cat: "craft-heritage", title: "स्थानीय शिल्प कार्यशाला", impact: 40, label: "कलाकार" },
    { cat: "samajik-seva", title: "जरूरतमंद परिवारों को सहायता", impact: 60, label: "परिवार" },
    { cat: "school-sahyog", title: "विद्यालय को पुस्तकालय सहयोग", impact: 300, label: "विद्यार्थी" },
    { cat: "yuva-vikas", title: "युवा नेतृत्व कार्यशाला", impact: 50, label: "युवा" },
    { cat: "innovation", title: "डिजिटल साक्षरता कार्यक्रम", impact: 90, label: "प्रशिक्षु" },
  ];
  for (let i = 1; i <= 40; i++) {
    const tpl = postTemplates[i % postTemplates.length];
    const title = `${tpl.title} — भाग ${Math.ceil(i / postTemplates.length)}`;
    const slug = `${tpl.cat}-${i}`;
    const exists = await prisma.post.findUnique({ where: { slug } });
    if (exists) continue;
    await prisma.post.create({
      data: {
        slug, title, categoryId: catMap[tpl.cat], date: daysFromNow(-i * 3),
        location: villages[i % villages.length], excerpt: `${tpl.title} के अंतर्गत NYS द्वारा आयोजित कार्यक्रम।`,
        content: `NYS द्वारा ${tpl.title} का सफल आयोजन किया गया। इस कार्यक्रम में समुदाय की सक्रिय भागीदारी रही और अनेक लोग लाभान्वित हुए।\n\nसंस्था भविष्य में भी इस प्रकार के कार्यक्रम जारी रखेगी।`,
        impactNumber: tpl.impact, impactLabel: tpl.label, status: "PUBLISHED",
        featured: i <= 3, authorId: superAdmin?.id, tags: JSON.stringify([tpl.cat, "NYS"]),
      },
    });
  }

  // ── Gallery ──
  for (let i = 1; i <= 12; i++) {
    const exists = await prisma.galleryItem.findFirst({ where: { title: `गतिविधि चित्र ${i}` } });
    if (!exists) {
      await prisma.galleryItem.create({
        data: { title: `गतिविधि चित्र ${i}`, category: ["Events", "शिक्षा", "पर्यावरण", "खेल"][i % 4], imageUrl: "" },
      });
    }
  }

  // ── Suggestions & Volunteers ──
  const firstMember = await prisma.member.findFirst({ where: { status: "ACTIVE" } });
  if (firstMember) {
    const sExists = await prisma.suggestion.findFirst({ where: { memberId: firstMember.id } });
    if (!sExists) {
      await prisma.suggestion.create({
        data: { memberId: firstMember.id, name: firstMember.fullName, subject: "अधिक वृक्षारोपण", category: "SUGGESTION", body: "हर महीने वृक्षारोपण कार्यक्रम होना चाहिए।", status: "NEW" },
      });
    }
    const vExists = await prisma.volunteer.findFirst({ where: { memberId: firstMember.id } });
    if (!vExists) {
      await prisma.volunteer.create({
        data: { memberId: firstMember.id, name: firstMember.fullName, mobile: firstMember.mobile, areas: JSON.stringify(["पर्यावरण", "शिक्षा"]), status: "NEW" },
      });
    }
  }

  console.log("✅ Seed पूर्ण।");
  console.log(`   Admin login: ${adminEmail} / ${adminPass}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
