-- NYS Posts — Neon Production DB
-- Run this in Neon SQL Editor
-- Total: 7 posts

-- ─── Post 1: प्रतिभाओं को प्रोत्साहन राशि — 16 अगस्त 2026 ───
INSERT INTO "Post" (
  "id","slug","title","headline","excerpt","content",
  "categoryId","location","date","featured","priority","reporter",
  "status","authorId","mainImage","images","youtubeUrl","facebookUrl",
  "impactNumber","impactLabel","createdAt","updatedAt"
) VALUES (
  'nys_post_001',
  'pratibhaon-ko-protsahan-rashi-vitaran-2026-aug',
  'प्रतिभाओं को प्रोत्साहन राशि वितरण — अगस्त 2026',
  '5 होनहार विद्यार्थियों को ₹25,500 की प्रोत्साहन राशि भेंट',
  'रा.उ.मा.वि. गूंदियाल नाडी में कक्षा 10 व 12 के 85% से अधिक अंकों वाले 5 विद्यार्थियों को NYS संरक्षक श्री ओमप्रकाश जी साईं द्वारा ₹5100/- प्रति विद्यार्थी प्रोत्साहन राशि प्रदान की गई।',
  'आज रा.उ.मा.वि. गूंदियाल नाडी में श्री नारायणपुरी युथ सोसायटी NYS के संरक्षक श्री ओमप्रकाश जी साईं द्वारा कक्षा 10 व 12 के 85% से अधिक अंकों वाली कुल 5 प्रतिभाओं को 5100/- प्रति विद्यार्थी प्रोत्साहन राशि भेंट की।

ओमप्रकाश जी के पिताश्री आदरणीय लुम्बाराम जी साईं द्वारा चेक भेंट किये गए।

कुल प्रोत्साहन राशि भेंट की - 25500/- रू ।

आपका बहुत बहुत आभार।',
  'cmsv8d2sh0006lxgo321wqdrv',
  'गूंदियाल नाडी, बालेसर',
  '2026-08-16T00:00:00.000Z',
  true,
  'IMPORTANT',
  'NYS टीम',
  'PUBLISHED',
  'cmsv8cyd90001lxgo83trq2dp',
  NULL, NULL, NULL, NULL, NULL, NULL,
  NOW(), NOW()
) ON CONFLICT ("id") DO NOTHING;

-- ─── Post 2: NYS-ITRHD बैठक — 2 जून 2026 ───
INSERT INTO "Post" (
  "id","slug","title","headline","excerpt","content",
  "categoryId","location","date","featured","priority","reporter",
  "status","authorId","mainImage","images","youtubeUrl","facebookUrl",
  "impactNumber","impactLabel","createdAt","updatedAt"
) VALUES (
  'nys_post_002',
  'nys-itrhd-baithak-gundiyal-model-village-2026',
  'NYS-ITRHD बैठक: गुदियाल मॉडल विलेज पहल — जून 2026',
  'गुदियाल गांव को मॉडल विलेज बनाने की दिशा में NYS और ITRHD की महत्वपूर्ण बैठक',
  'दिल्ली में NYS और ITRHD के बीच ऐतिहासिक बैठक — गुदियाल गांव को आदर्श मॉडल विलेज के रूप में विकसित करने की रूपरेखा तय की गई।',
  'नारायणपुरी यूथ सोसाइटी NYS, गुदियाल के लिए यह अत्यंत गर्व, सम्मान और प्रेरणा का विषय है कि हमारी संस्था की महत्वपूर्ण बैठक ITRHD संस्था के साथ संपन्न हुई। इस बैठक में गुदियाल गांव के भविष्य, ग्रामीण विकास, शिक्षा, खेल, पर्यावरण, क्राफ्ट, संस्कृति और सामाजिक उत्थान जैसे महत्वपूर्ण विषयों पर विस्तार से चर्चा की गई।

इस विशेष बैठक में हमारी संस्था NYS के मुख्य संरक्षक डॉ. कर्नल बलदेव सिंह मानव और सुरेन्द्र चौधरी जी उपस्थित रहे। दिल्ली में आयोजित इस महत्वपूर्ण मुलाकात के दौरान SK Mishra Sir से विशेष चर्चा हुई, जिसमें गुदियाल गांव को आने वाले समय में एक आदर्श और प्रेरणादायक गांव के रूप में विकसित करने की रूपरेखा पर विचार-विमर्श किया गया।

सबसे बड़ी और गौरवपूर्ण बात यह रही कि ITRHD संस्था ने भविष्य में गुदियाल विलेज को "Model Village" के रूप में गोद लेने की सकारात्मक पहल की है।

शिक्षा, खेल, पर्यावरण, क्राफ्ट, महिला सशक्तिकरण, युवा नेतृत्व और सामाजिक जागरूकता को विशेष प्राथमिकता दी जाएगी।

NYS और ITRHD के सहयोग से गांव के उज्ज्वल भविष्य की मजबूत नींव रखी जा रही है।

गुदियाल बनेगा मॉडल विलेज — शिक्षा, खेल, पर्यावरण, क्राफ्ट, संस्कृति और सामाजिक विकास के साथ नई पहचान।

नारायणपुरी यूथ सोसाइटी NYS, गुदियाल
सेवा • शिक्षा • युवा शक्ति • पर्यावरण • संस्कृति • विकास',
  'cmsv8d493000blxgosy0izp8i',
  'दिल्ली',
  '2026-06-02T00:00:00.000Z',
  false,
  'IMPORTANT',
  'NYS टीम',
  'PUBLISHED',
  'cmsv8cyd90001lxgo83trq2dp',
  NULL, NULL, NULL, NULL, NULL, NULL,
  NOW(), NOW()
) ON CONFLICT ("id") DO NOTHING;

-- ─── Post 3: Welcome Back Champion — 28 दिसंबर 2025 ───
INSERT INTO "Post" (
  "id","slug","title","headline","excerpt","content",
  "categoryId","location","date","featured","priority","reporter",
  "status","authorId","mainImage","images","youtubeUrl","facebookUrl",
  "impactNumber","impactLabel","createdAt","updatedAt"
) VALUES (
  'nys_post_003',
  'welcome-back-champion-priyanka-poonya-2025',
  'Welcome Back Champion — प्रियंका पूनिया का जोरदार स्वागत',
  'गूंदियाल की बेटी प्रियंका पूनिया की चैंपियन की तरह वापसी',
  'IHF Youth Women Trophy 2025 में भारत का प्रतिनिधित्व करने के बाद गूंदियाल की बेटी प्रियंका पूनिया का जोरदार स्वागत किया गया।',
  'Welcome Back Champion! 🏆

IHF Youth Women Trophy (Under-17) 2025 - Asia में भारत का प्रतिनिधित्व करने के बाद गूंदियाल की बेटी प्रियंका पूनिया की शानदार वापसी हुई।

गूंदियाल नगर की इस बेटी ने पूरे गांव और जिले का नाम रोशन किया है। NYS परिवार की ओर से प्रियंका को हार्दिक बधाई और शुभकामनाएं।',
  'cmsv8d3an0007lxgo3qnsc5s3',
  'गूंदियाल नगर',
  '2025-12-28T00:00:00.000Z',
  false,
  'NORMAL',
  'NYS टीम',
  'PUBLISHED',
  'cmsv8cyd90001lxgo83trq2dp',
  NULL, NULL, NULL, NULL, NULL, NULL,
  NOW(), NOW()
) ON CONFLICT ("id") DO NOTHING;

-- ─── Post 4: IHF Handball Full — 28 दिसंबर 2025 ───
INSERT INTO "Post" (
  "id","slug","title","headline","excerpt","content",
  "categoryId","location","date","featured","priority","reporter",
  "status","authorId","mainImage","images","youtubeUrl","facebookUrl",
  "impactNumber","impactLabel","createdAt","updatedAt"
) VALUES (
  'nys_post_004',
  'ihf-youth-women-trophy-2025-priyanka-silver-medal',
  'IHF Youth Women Trophy 2025 — प्रियंका पूनिया की शानदार उपलब्धि',
  'थाईलैंड में भारतीय हैंडबॉल टीम ने सिल्वर मेडल जीता — गूंदियाल की बेटी प्रियंका का जोरदार स्वागत',
  'थाईलैंड में IHF Youth Women Trophy 2025 में भारत ने उज़्बेकिस्तान से 1 गोल से हारकर सिल्वर मेडल जीता। गूंदियाल की प्रियंका पूनिया टीम में शामिल थीं।',
  'थाईलैंड में आयोजित हुई इंटरनेशनल हैंडबॉल फेडरेशन (आईएचएफ) युथ वीमेन ट्रॉफी (अंडर17) 2025 - एशिया में भारत की महिला हैंडबॉल टीम ने रोमांचक फ़ाइनल मैच में उज़्बेकिस्तान से मात्र 1 गोल से हारकर सिल्वर मेडल अपने नाम किया।

गौरतलब है कि जाटी भांडु ग्राम पंचायत के गूंदियाल नगर गांव के रा.उ.मा.वि. गूंदियाल नाडी में पढ़ी प्रियंका पूनिया भारतीय हैंडबॉल फेडरेशन द्वारा चयनित होने पर इस प्रतियोगिता में भाग लेने वाली भारतीय टीम में शामिल थी।

हमारे विद्यालय की बिटिया गुड्डी ने राजस्थान की टीम से खेलते हुए भारतीय हैंडबाल फेडरेशन द्वारा आयोजित राष्ट्रीय हैंडबॉल प्रतियोगिता में भाग लेकर आई है।

दोनों बिटियाओं का इन उपलब्धियों के बाद पहली बार अपने गांव आना हुआ। दोनों को गौरवमयी उपलब्धि द्वारा गूंदियाल का नाम रोशन करने पर ग्रामीण जनों, अभिभावकों व NYS द्वारा जोधपुर रेलवे स्टेशन से गूंदियाल तक रैली निकाली गई और बिटियाओं का बहुमान किया गया।

NYS संरक्षक ओमप्रकाश चौधरी ने प्रियंका को इस शानदार उपलब्धि पर इक्यावन हजार रूपये (₹51,000) की प्रोत्साहन राशि देने की घोषणा की है।

उद्योगपति छैलाराम जी मुंडन (एम.सी.सी.) द्वारा रा.उ.मा.वि. गूंदियाल नाडी के खेल मैदान में 400 मीटर का ट्रैक विकसित किया जा रहा है।

प्रियंका ने हर उस लड़की के माता-पिता को उम्मीद बंधाई है कि उनकी बेटी या बेटा भी आगे बढ़ सकते हैं।',
  'cmsv8d3an0007lxgo3qnsc5s3',
  'थाईलैंड / गूंदियाल',
  '2025-12-28T00:00:00.000Z',
  true,
  'IMPORTANT',
  'NYS टीम',
  'PUBLISHED',
  'cmsv8cyd90001lxgo83trq2dp',
  NULL, NULL, NULL, NULL, NULL, NULL,
  NOW(), NOW()
) ON CONFLICT ("id") DO NOTHING;

-- ─── Post 5: गुंदियाल की बेटी स्वागत — 26 दिसंबर 2025 ───
INSERT INTO "Post" (
  "id","slug","title","headline","excerpt","content",
  "categoryId","location","date","featured","priority","reporter",
  "status","authorId","mainImage","images","youtubeUrl","facebookUrl",
  "impactNumber","impactLabel","createdAt","updatedAt"
) VALUES (
  'nys_post_005',
  'gundiyal-ki-beti-priyanka-swagat-2025-dec',
  'गुंदियाल की बेटी प्रियंका का स्वागत अभिनंदन — 26 दिसंबर 2025',
  'गुंदियाल की बेटी प्रियंका का भव्य स्वागत अभिनंदन',
  'IHF Youth Women Trophy में सिल्वर मेडल जीतकर लौटीं प्रियंका पूनिया का गूंदियाल में भव्य स्वागत किया गया।',
  'IHF Youth Women Trophy (Under-17) 2025 में भारत का प्रतिनिधित्व कर सिल्वर मेडल जीतकर लौटीं गूंदियाल की बेटी प्रियंका पूनिया का गांव में भव्य स्वागत अभिनंदन किया गया।

ग्रामीण जनों, अभिभावकों, NYS टीम और क्षेत्र के गणमान्य नागरिकों ने प्रियंका का गर्मजोशी से स्वागत किया।

NYS परिवार की ओर से प्रियंका को इस अद्भुत उपलब्धि पर हार्दिक बधाई।',
  'cmsv8d3an0007lxgo3qnsc5s3',
  'गूंदियाल नगर',
  '2025-12-26T00:00:00.000Z',
  false,
  'NORMAL',
  'NYS टीम',
  'PUBLISHED',
  'cmsv8cyd90001lxgo83trq2dp',
  NULL, NULL, NULL, NULL, NULL, NULL,
  NOW(), NOW()
) ON CONFLICT ("id") DO NOTHING;

-- ─── Post 6: हैंडबॉल सिल्वर मेडल — 27 नवंबर 2025 ───
INSERT INTO "Post" (
  "id","slug","title","headline","excerpt","content",
  "categoryId","location","date","featured","priority","reporter",
  "status","authorId","mainImage","images","youtubeUrl","facebookUrl",
  "impactNumber","impactLabel","createdAt","updatedAt"
) VALUES (
  'nys_post_006',
  'handball-silver-medal-ihf-2025-nov',
  'भारतीय महिला हैंडबॉल टीम का ऐतिहासिक सिल्वर मेडल — नवंबर 2025',
  'थाईलैंड में IHF Youth Women Trophy — भारत को सिल्वर, गूंदियाल की बेटी टीम में शामिल',
  'थाईलैंड में IHF Youth Women Trophy (Under-17) 2025 में भारतीय महिला हैंडबॉल टीम ने सिल्वर मेडल जीता। गूंदियाल की प्रियंका पूनिया भारतीय टीम का हिस्सा थीं।',
  'थाईलैंड में आयोजित इंटरनेशनल हैंडबॉल फेडरेशन (आईएचएफ) युथ वीमेन ट्रॉफी (अंडर17) 2025 - एशिया में भारत की महिला हैंडबॉल टीम ने सिल्वर मेडल जीता।

गूंदियाल नगर (जाटी भांडु, बालेसर) की बेटी प्रियंका पूनिया भारतीय हैंडबॉल फेडरेशन द्वारा चयनित होकर इस अंतर्राष्ट्रीय प्रतियोगिता में भारत का प्रतिनिधित्व करने वाली भारतीय टीम में शामिल थीं।

यह गूंदियाल गांव और पूरे जिले के लिए गर्व का ऐतिहासिक पल है।

NYS की ओर से प्रियंका और पूरी भारतीय टीम को हार्दिक बधाई एवं शुभकामनाएं।',
  'cmsv8d3an0007lxgo3qnsc5s3',
  'थाईलैंड',
  '2025-11-27T00:00:00.000Z',
  false,
  'IMPORTANT',
  'NYS टीम',
  'PUBLISHED',
  'cmsv8cyd90001lxgo83trq2dp',
  NULL, NULL, NULL, NULL, NULL, NULL,
  NOW(), NOW()
) ON CONFLICT ("id") DO NOTHING;

-- ─── Post 7: हैंडबॉल टीम इंडिया — 27 नवंबर 2025 ───
INSERT INTO "Post" (
  "id","slug","title","headline","excerpt","content",
  "categoryId","location","date","featured","priority","reporter",
  "status","authorId","mainImage","images","youtubeUrl","facebookUrl",
  "impactNumber","impactLabel","createdAt","updatedAt"
) VALUES (
  'nys_post_007',
  'handball-team-india-nys-gundiyal-2025',
  'हैंडबॉल टीम इंडिया — NYS गूंदियाल',
  'हैंडबॉल टीम इंडिया — गूंदियाल की बेटी अंतर्राष्ट्रीय टीम में',
  'IHF Youth Women Trophy 2025 में भारत का प्रतिनिधित्व करने वाली भारतीय हैंडबॉल टीम में गूंदियाल की बेटी का चयन।',
  'हैंडबॉल टीम इंडिया! 🇮🇳

IHF Youth Women Trophy (Under-17) 2025 - एशिया में भारत का प्रतिनिधित्व करने वाली भारतीय महिला हैंडबॉल टीम में गूंदियाल नगर की बेटी प्रियंका पूनिया का चयन हुआ।

NYS परिवार को गर्व है कि हमारे गांव की बेटी ने अंतर्राष्ट्रीय स्तर पर भारत का नाम रोशन किया।

जय हिंद! 🇮🇳',
  'cmsv8d3an0007lxgo3qnsc5s3',
  'थाईलैंड',
  '2025-11-27T00:00:00.000Z',
  false,
  'NORMAL',
  'NYS टीम',
  'PUBLISHED',
  'cmsv8cyd90001lxgo83trq2dp',
  NULL, NULL, NULL, NULL, NULL, NULL,
  NOW(), NOW()
) ON CONFLICT ("id") DO NOTHING;
