import { ManagedOfficialSite, Scheme } from '../types/scheme';

export const DEFAULT_OFFICIAL_PORTALS: ManagedOfficialSite[] = [
  {
    id: 'portal-ambedkar-scholarship',
    title: 'Dr. Ambedkar Scholarship Portal Punjab',
    url: 'https://scholarships.punjab.gov.in',
    description: 'Official Punjab portal for Post-Matric SC/BC student scholarships, Freeship Cards, and college tuition fee waivers.',
    category: 'Students & Education',
    createdAt: '2026-10-15T10:00:00.000Z'
  },
  {
    id: 'portal-nsp',
    title: 'National Scholarship Portal (NSP 2.0)',
    url: 'https://scholarships.gov.in',
    description: 'One-stop Central & State Government scholarship portal for school, college, ITI, technical, and minority students.',
    category: 'Students & Education',
    createdAt: '2026-10-15T10:05:00.000Z'
  },
  {
    id: 'portal-vidyalakshmi',
    title: 'PM Vidyalaxmi Education Loan Portal',
    url: 'https://www.vidyalakshmi.co.in',
    description: 'Single-window portal for students to apply for collateral-free higher education loans and interest subsidies across 45+ banks.',
    category: 'Students & Education',
    createdAt: '2026-10-15T10:10:00.000Z'
  },
  {
    id: 'portal-skill-india',
    title: 'Skill India Digital Hub (PMKVY 4.0)',
    url: 'https://www.skillindiadigital.gov.in',
    description: 'Free government AI, coding, drone, and vocational certification courses with stipend support for youth and students.',
    category: 'Students & Education',
    createdAt: '2026-10-15T10:15:00.000Z'
  },
  {
    id: 'portal-swayam',
    title: 'SWAYAM Free University Courses Portal',
    url: 'https://swayam.gov.in',
    description: 'Ministry of Education platform offering free online courses from IITs, IIMs, and central universities with credit transfer.',
    category: 'Students & Education',
    createdAt: '2026-10-15T10:20:00.000Z'
  },
  {
    id: 'portal-epunjabschool',
    title: 'e-Punjab School Education Portal',
    url: 'https://www.epunjabschool.gov.in',
    description: 'Department of School Education Punjab portal for pre-matric scholarships, uniforms, books, and merit school admissions.',
    category: 'Students & Education',
    createdAt: '2026-10-15T10:25:00.000Z'
  },
  {
    id: 'portal-pgrkam',
    title: 'Punjab Ghar Ghar Rozgar Portal (PGRKAM)',
    url: 'https://pgrkam.com',
    description: 'Official Punjab employment bureau portal for youth job fairs, Mera Kaam Mera Maan ₹2,500/month stipend, and free coaching.',
    category: 'Jobs & Skill Training',
    createdAt: '2026-10-15T10:30:00.000Z'
  },
  {
    id: 'portal-connect-punjab',
    title: 'Connect Punjab (e-Sewa Kendra Online Portal)',
    url: 'https://connect.punjab.gov.in',
    description: 'Apply online for Residence/Domicile, Caste (SC/BC), Income, Birth/Death, and Marriage certificates in Punjab.',
    category: 'Citizen e-Services',
    createdAt: '2026-10-15T10:35:00.000Z'
  },
  {
    id: 'portal-pmkisan',
    title: 'PM-Kisan Samman Nidhi Official Portal',
    url: 'https://pmkisan.gov.in',
    description: 'Farmer registration, OTP e-KYC, beneficiary status check, and Kisan Credit Card (KCC) ₹6,000/year DBT support.',
    category: 'Agriculture & Farmers',
    createdAt: '2026-10-15T10:40:00.000Z'
  },
  {
    id: 'portal-agripunjab',
    title: 'Department of Agriculture & Farmers Welfare Punjab',
    url: 'https://agri.punjab.gov.in',
    description: 'Crop residue management (CRM) machinery subsidies, high-yield seeds, soil health cards, and DSR ₹1,500/acre incentives.',
    category: 'Agriculture & Farmers',
    createdAt: '2026-10-15T10:45:00.000Z'
  },
  {
    id: 'portal-jamabandi',
    title: 'Punjab Land Records Portal (Jamabandi)',
    url: 'https://jamabandi.punjab.gov.in',
    description: 'Download digitally signed Fard / Jamabandi land records, mutation status, and Khasra Girdawari required for farmer schemes.',
    category: 'Agriculture & Farmers',
    createdAt: '2026-10-15T10:50:00.000Z'
  },
  {
    id: 'portal-pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    url: 'https://pmfby.gov.in',
    description: 'Comprehensive crop insurance calculator, policy application, and weather/yield loss claim tracking for farmers.',
    category: 'Agriculture & Farmers',
    createdAt: '2026-10-15T10:55:00.000Z'
  },
  {
    id: 'portal-sha-punjab',
    title: 'State Health Agency Punjab (Ayushman Sarbat Sehat)',
    url: 'https://sha.punjab.gov.in',
    description: 'Check eligibility and empanelled hospitals for ₹5 Lakh/year cashless family health insurance in Punjab.',
    category: 'Health & Medical',
    createdAt: '2026-10-15T11:00:00.000Z'
  },
  {
    id: 'portal-sswcd-punjab',
    title: 'Social Security & Women/Child Development Punjab',
    url: 'https://sswcd.punjab.gov.in',
    description: 'Official portal for ₹1,500/month Old Age Pension, Widow Pension, Disability Pension, and Women Welfare schemes.',
    category: 'Pensions & Social Security',
    createdAt: '2026-10-15T11:05:00.000Z'
  },
  {
    id: 'portal-welfare-punjab',
    title: 'Department of Social Justice & Empowerment Punjab',
    url: 'https://welfarepunjab.gov.in',
    description: 'Apply for Ashirwad (Shagun) ₹51,000 marriage assistance, SC/BC low-interest loans, and Ambedkar welfare grants.',
    category: 'Women & Social Welfare',
    createdAt: '2026-10-15T11:10:00.000Z'
  },
  {
    id: 'portal-eshram',
    title: 'e-Shram National Unorganised Workers Portal',
    url: 'https://eshram.gov.in',
    description: 'Register for universal labour UAN card, ₹2 Lakh PMSBY accidental insurance cover, and ₹3,000/month Shram Yogi pension.',
    category: 'Labour & Workers',
    createdAt: '2026-10-15T11:15:00.000Z'
  },
  {
    id: 'portal-pmvishwakarma',
    title: 'PM Vishwakarma Artisans Official Portal',
    url: 'https://pmvishwakarma.gov.in',
    description: '₹15,000 toolkit e-voucher, ₹500/day training stipend, and up to ₹3 Lakh 5% collateral-free loan for 18 artisan trades.',
    category: 'Loans & Self-Employment',
    createdAt: '2026-10-15T11:20:00.000Z'
  },
  {
    id: 'portal-jansamarth',
    title: 'JanSamarth National Credit-Linked Schemes Portal',
    url: 'https://www.jansamarth.in',
    description: 'Unified digital portal to check eligibility and apply online for 15+ government loan & subsidy schemes including Mudra & Stand-Up India.',
    category: 'Loans & Self-Employment',
    createdAt: '2026-10-15T11:25:00.000Z'
  },
  {
    id: 'portal-epos-punjab',
    title: 'ePos Punjab Smart Ration Card Portal',
    url: 'https://epos.punjab.gov.in',
    description: 'Check Punjab Smart Ration Card family member details, monthly free wheat entitlement, and fair price depot transactions.',
    category: 'Food & Ration Security',
    createdAt: '2026-10-15T11:30:00.000Z'
  },
  {
    id: 'portal-pspcl',
    title: 'PSPCL Punjab 300 Units Free Electricity Portal',
    url: 'https://pspcl.in',
    description: 'Punjab State Power Corporation portal for 300 units/month (600 units bi-monthly) zero electricity bill & agricultural connections.',
    category: 'Citizen e-Services',
    createdAt: '2026-10-15T11:35:00.000Z'
  },
  {
    id: 'portal-pmayg',
    title: 'Pradhan Mantri Awas Yojana (PMAY-G & Urban)',
    url: 'https://pmayg.nic.in',
    description: 'Check rural & urban housing beneficiary waitlists and ₹1.20 Lakh–₹2.50 Lakh pucca house construction grant installments.',
    category: 'Housing & Shelter',
    createdAt: '2026-10-15T11:40:00.000Z'
  },
  {
    id: 'portal-myscheme',
    title: 'myScheme National Government Schemes Directory',
    url: 'https://www.myscheme.gov.in',
    description: 'Government of India national platform indexing central and state welfare schemes across all ministries.',
    category: 'Citizen e-Services',
    createdAt: '2026-10-15T11:45:00.000Z'
  }
];

export interface AiDiscoveredBundle {
  scheme: Scheme;
  portal: ManagedOfficialSite;
  era: 'new' | 'purani';
  launchYear: string;
}

export function getSchemeEra(scheme: Scheme): 'new' | 'purani' {
  const id = scheme.id.toLowerCase();
  const tags = scheme.categoryTags.map((t) => t.toLowerCase());
  if (
    id.includes('purani') ||
    tags.some((t) => t.includes('purani') || t.includes('classic'))
  ) {
    return 'purani';
  }
  if (
    id.includes('2026') ||
    id.includes('surya-ghar') ||
    id.includes('lakhpati') ||
    id.includes('vay-vandana') ||
    id.includes('vidyalaxmi') ||
    id.includes('internship') ||
    id.includes('maavaan') ||
    id.includes('aam-aadmi-clinic') ||
    id.includes('doorstep') ||
    id.includes('300-units') ||
    id.includes('free-bus') ||
    tags.some((t) => t.includes('new scheme') || t.includes('2026'))
  ) {
    return 'new';
  }
  return 'purani';
}

export const AI_DISCOVERABLE_SCHEMES_POOL: AiDiscoveredBundle[] = [
  {
    era: 'new',
    launchYear: '2026 (New)',
    scheme: {
      id: 'ai-punjab-maavaan-dhiaan-satkar-2026',
      titleEn: 'Mukhyamantri Maavaan Dhiaan Satkar Yojana (₹1,000–₹1,500/Month Women Honor Grant)',
      titlePa: 'ਮੁੱਖ ਮੰਤਰੀ ਮਾਵਾਂ ਧੀਆਂ ਸਤਿਕਾਰ ਯੋਜਨਾ (ਔਰਤਾਂ ਲਈ ₹1,000–₹1,500 ਪ੍ਰਤੀ ਮਹੀਨਾ ਸਨਮਾਨ ਭੱਤਾ)',
      titleHi: 'मुख्यमंत्री मावां धियां सत्कार योजना (महिलाओं के लिए ₹1,000–₹1,500 प्रतिमाह सम्मान भत्ता)',
      level: 'Punjab State',
      departmentEn: 'Department of Social Security, Women & Child Development, Punjab',
      departmentPa: 'ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ, ਇਸਤਰੀ ਅਤੇ ਬਾਲ ਵਿਕਾਸ ਵਿਭਾਗ, ਪੰਜਾਬ',
      departmentHi: 'सामाजिक सुरक्षा, महिला एवं बाल विकास विभाग, पंजाब',
      categoryTags: ['Women', 'Direct Benefit Transfer', 'New Scheme 2026', 'Social Security', 'AI Admin Added'],
      descriptionEn: 'Flagship Punjab Government women empowerment scheme providing ₹1,000 per month (₹1,500/month for SC/BC/destitute women) directly into the Aadhaar-linked bank accounts of adult women aged 18+ across Punjab.',
      descriptionPa: 'ਪੰਜਾਬ ਸਰਕਾਰ ਦੀ ਨਵੀਂ ਪ੍ਰਮੁੱਖ ਯੋਜਨਾ ਜਿਸ ਤਹਿਤ ਪੰਜਾਬ ਦੀਆਂ 18 ਸਾਲ ਤੋਂ ਵੱਧ ਉਮਰ ਦੀਆਂ ਮਹਿਲਾਵਾਂ ਨੂੰ ₹1,000 ਪ੍ਰਤੀ ਮਹੀਨਾ (SC/BC ਮਹਿਲਾਵਾਂ ਨੂੰ ₹1,500/ਮਹੀਨਾ) ਸਿੱਧੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਦਿੱਤੇ ਜਾਂਦੇ ਹਨ।',
      descriptionHi: 'पंजाब सरकार की नई प्रमुख महिला सशक्तिकरण योजना जिसके तहत 18+ आयु की महिलाओं को ₹1,000 प्रतिमाह (SC/BC महिलाओं को ₹1,500/माह) सीधे बैंक खाते में दिए जाते हैं।',
      benefitAmountText: '₹1,000 to ₹1,500 / month (₹12,000–₹18,000 / year Direct Bank Transfer)',
      benefitType: 'Direct Cash Transfer',
      minAge: 18,
      targetGenders: ['Female'],
      requiresPunjabDomicile: true,
      maxIncome: 300000,
      applicationDeadline: 'Open at All Punjab Sewa Kendras & Anganwadi Camps (2026-27)',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://sswcd.punjab.gov.in',
      officialPortalName: 'Social Security & Women Welfare Punjab',
      youtubeVideoId: 'v2avonSHyFU',
      youtubeVideoTitle: 'Mukhyamantri Maavaan Dhiaan Satkar Yojana Punjab ₹1000-₹1500 Online Registration Guide',
      requiredDocuments: [
        { nameEn: 'Aadhaar Card & Voter ID with Punjab Address', namePa: 'ਪੰਜਾਬ ਦੇ ਪਤੇ ਵਾਲਾ ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਵੋਟਰ ਕਾਰਡ', nameHi: 'पंजाब के पते वाला आधार और वोटर कार्ड', issuingAuthority: 'UIDAI / Election Commission', availableOnDigiLocker: true },
        { nameEn: 'Active Bank Passbook (NPCI / DBT Enabled)', namePa: 'ਬੈਂਕ ਪਾਸਬੁੱਕ (ਆਧਾਰ NPCI ਨਾਲ ਲਿੰਕ)', nameHi: 'बैंक पासबुक (NPCI से लिंक)', issuingAuthority: 'Bank', availableOnDigiLocker: true },
        { nameEn: 'SC/BC Certificate (for ₹1,500/month slab)', namePa: 'SC/BC ਜਾਤੀ ਸਰਟੀਫਿਕੇਟ (₹1,500 ਮਹੀਨਾਵਾਰ ਸਲੈਬ ਲਈ)', nameHi: 'SC/BC जाति प्रमाण पत्र', issuingAuthority: 'Tehsildar / Sewa Kendra', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Complete e-KYC at Nearest Punjab Sewa Kendra or Camp',
          titlePa: 'ਨੇੜਲੇ ਪੰਜਾਬ ਸੇਵਾ ਕੇਂਦਰ ਜਾਂ ਵਿਸ਼ੇਸ਼ ਕੈਂਪ ਵਿੱਚ ਆਧਾਰ ਈ-ਕੇਵਾਈਸੀ ਕਰਵਾਓ',
          titleHi: 'नजदीकी पंजाब सेवा केंद्र या विशेष कैंप में आधार ई-केवाईसी कराएं',
          descriptionEn: 'Link your Punjab Voter ID, Aadhaar, and bank account free of cost.',
          descriptionPa: 'ਆਪਣਾ ਵੋਟਰ ਕਾਰਡ, ਆਧਾਰ ਅਤੇ ਬੈਂਕ ਖਾਤਾ ਬਿਲਕੁਲ ਮੁਫ਼ਤ ਲਿੰਕ ਕਰਵਾਓ।',
          descriptionHi: 'अपना वोटर कार्ड, आधार और बैंक खाता निःशुल्क लिंक कराएं।'
        },
        {
          stepNumber: 2,
          titleEn: 'Monthly DBT Transfer on 10th of Every Month',
          titlePa: 'ਹਰ ਮਹੀਨੇ ਸਿੱਧਾ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਭੁਗਤਾਨ (DBT)',
          titleHi: 'प्रत्येक माह सीधे बैंक खाते में डीबीटी भुगतान',
          descriptionEn: 'Amount is credited directly to the woman beneficiary’s savings account.',
          descriptionPa: 'ਸਨਮਾਨ ਭੱਤਾ ਸਿੱਧਾ ਮਹਿਲਾ ਲਾਭਪਾਤਰੀ ਦੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦਾ ਹੈ।',
          descriptionHi: 'सम्मान राशि सीधे महिला लाभार्थी के बैंक खाते में जमा होती है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Punjab Budget 2026-27 Gazette Notification (New Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-maavaan-dhiaan-punjab',
      title: 'Mukhyamantri Maavaan Dhiaan Satkar Portal (SSWCD Punjab)',
      url: 'https://sswcd.punjab.gov.in',
      description: 'Official Punjab Women & Child Development portal for ₹1,000–₹1,500/month women honor grant and pension services.',
      category: 'Women & Social Welfare',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'new',
    launchYear: '2026 (New)',
    scheme: {
      id: 'ai-punjab-cm-young-intern-2026',
      titleEn: 'Shaheed Bhagat Singh Punjab Youth Internship & Digital Laptop Grant',
      titlePa: 'ਸ਼ਹੀਦ ਭਗਤ ਸਿੰਘ ਪੰਜਾਬ ਯੂਥ ਇੰਟਰਨਸ਼ਿਪ ਅਤੇ ਡਿਜੀਟਲ ਲੈਪਟਾਪ ਗ੍ਰਾਂਟ',
      titleHi: 'शहीद भगत सिंह पंजाब युवा इंटर्नशिप एवं डिजिटल लैपटॉप अनुदान',
      level: 'Punjab State',
      departmentEn: 'Department of Higher Education & Youth Services, Punjab',
      departmentPa: 'ਉਚੇਰੀ ਸਿੱਖਿਆ ਅਤੇ ਯੁਵਕ ਸੇਵਾਵਾਂ ਵਿਭਾਗ, ਪੰਜਾਬ',
      departmentHi: 'उच्च शिक्षा एवं युवा सेवा विभाग, पंजाब',
      categoryTags: ['Students', 'Education', 'Youth', 'Scholarship', 'New Scheme 2026', 'AI Admin Added'],
      descriptionEn: 'Provides meritorious college/ITI/university students in Punjab with a ₹25,000 laptop/tablet voucher and a ₹10,000/month e-governance internship stipend.',
      descriptionPa: 'ਪੰਜਾਬ ਦੇ ਕਾਲਜ, ਆਈ.ਟੀ.ਆਈ ਅਤੇ ਯੂਨੀਵਰਸਿਟੀ ਦੇ ਹੋਣਹਾਰ ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ₹25,000 ਦਾ ਲੈਪਟਾਪ ਵਾਊਚਰ ਅਤੇ ₹10,000 ਪ੍ਰਤੀ ਮਹੀਨਾ ਇੰਟਰਨਸ਼ਿਪ ਭੱਤਾ।',
      descriptionHi: 'पंजाब के कॉलेज, आईटीआई और विश्वविद्यालय के मेधावी छात्रों को ₹25,000 का लैपटॉप वाउचर और ₹10,000 प्रति माह इंटर्नशिप स्टाइपेंड।',
      benefitAmountText: '₹25,000 Laptop Voucher + ₹10,000/month Internship Stipend',
      benefitType: 'Scholarship',
      minAge: 16,
      maxAge: 30,
      eligibleOccupations: ['Student', 'Unemployed Youth'],
      requiresPunjabDomicile: true,
      maxIncome: 400000,
      applicationDeadline: 'Open for 2026-27 Academic Session',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://higheredu.punjab.gov.in',
      officialPortalName: 'Department of Higher Education Punjab',
      youtubeVideoId: 'pJBv6JWgX8E',
      youtubeVideoTitle: 'Shaheed Bhagat Singh Punjab Youth Internship & Student Laptop Voucher Apply Guide',
      requiredDocuments: [
        { nameEn: 'Aadhaar Card linked with Mobile', namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ', nameHi: 'मोबाइल से जुड़ा आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true },
        { nameEn: 'College / ITI / University Bonafide ID Card', namePa: 'ਕਾਲਜ / ਆਈ.ਟੀ.ਆਈ ਸ਼ਨਾਖਤੀ ਕਾਰਡ', nameHi: 'कॉलेज / आईटीआई पहचान पत्र', issuingAuthority: 'Educational Institution', availableOnDigiLocker: false },
        { nameEn: 'Punjab Residence / Domicile Certificate', namePa: 'ਪੰਜਾਬ ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ', nameHi: 'पंजाब निवास प्रमाण पत्र', issuingAuthority: 'Sewa Kendra / Tehsildar', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Online Student Verification on HigherEdu Portal',
          titlePa: 'ਉਚੇਰੀ ਸਿੱਖਿਆ ਪੋਰਟਲ \'ਤੇ ਆਨਲਾਈਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
          titleHi: 'उच्च शिक्षा पोर्टल पर ऑनलाइन पंजीकरण',
          descriptionEn: 'Verify student enrollment number and Aadhaar on higheredu.punjab.gov.in.',
          descriptionPa: 'higheredu.punjab.gov.in \'ਤੇ ਆਪਣਾ ਦਾਖਲਾ ਨੰਬਰ ਅਤੇ ਆਧਾਰ ਤਸਦੀਕ ਕਰੋ।',
          descriptionHi: 'higheredu.punjab.gov.in पर अपना नामांकन नंबर और आधार सत्यापित करें।'
        },
        {
          stepNumber: 2,
          titleEn: 'Receive e-RUPI Laptop Voucher & Internship Placement',
          titlePa: 'ਲੈਪਟਾਪ ਈ-ਵਾਊਚਰ ਅਤੇ ਇੰਟਰਨਸ਼ਿਪ ਪ੍ਰਾਪਤੀ',
          titleHi: 'लैपटॉप ई-वाउचर और इंटर्नशिप प्लेसमेंट',
          descriptionEn: 'Instant e-voucher issued to student mobile after principal nodal approval.',
          descriptionPa: 'ਕਾਲਜ ਪ੍ਰਿੰਸੀਪਲ ਦੀ ਮਨਜ਼ੂਰੀ ਤੋਂ ਬਾਅਦ ਮੋਬਾਈਲ \'ਤੇ ਈ-ਵਾਊਚਰ ਮਿਲਦਾ ਹੈ।',
          descriptionHi: 'प्राचार्य की स्वीकृति के बाद मोबाइल पर ई-वाउचर जारी होता है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Dept of Higher Education Punjab Notification 2026 (New Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-higheredu-punjab',
      title: 'Higher Education & Languages Department Punjab',
      url: 'https://higheredu.punjab.gov.in',
      description: 'Official Punjab portal for college student internships, CM merit scholarships, and digital learning grants.',
      category: 'Students & Education',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'new',
    launchYear: '2025-26 (New)',
    scheme: {
      id: 'ai-pm-surya-ghar-punjab-2026',
      titleEn: 'PM Surya Ghar: Muft Bijli Rooftop Solar Subsidy Scheme',
      titlePa: 'ਪੀ.ਐਮ ਸੂਰਿਆ ਘਰ: ਮੁਫ਼ਤ ਬਿਜਲੀ ਰੂਫ਼ਟਾਪ ਸੋਲਰ ਸਬਸਿਡੀ ਸਕੀਮ',
      titleHi: 'पीएम सूर्य घर: मुफ्त बिजली रूफटॉप सोलर सब्सिडी योजना',
      level: 'Central Government',
      departmentEn: 'Ministry of New & Renewable Energy (MNRE) & PEDA Punjab',
      departmentPa: 'ਨਵੀਂ ਅਤੇ ਨਵਿਆਉਣਯੋਗ ਊਰਜਾ ਮੰਤਰਾਲਾ ਅਤੇ ਪੇਡਾ ਪੰਜਾਬ',
      departmentHi: 'नवीन और नवीकरणीय ऊर्जा मंत्रालय एवं पेडा पंजाब',
      categoryTags: ['Subsidy', 'Free Electricity', 'Finance', 'New Scheme 2026', 'AI Admin Added'],
      descriptionEn: 'Central government capital subsidy up to ₹78,000 for installing residential rooftop solar panels (up to 3 kW) with low-interest bank financing and net metering.',
      descriptionPa: 'ਘਰ ਦੀ ਛੱਤ \'ਤੇ 3 ਕਿਲੋਵਾਟ ਤੱਕ ਸੋਲਰ ਪੈਨਲ ਲਗਾਉਣ ਲਈ ₹78,000 ਤੱਕ ਦੀ ਸਿੱਧੀ ਸਰਕਾਰੀ ਸਬਸਿਡੀ ਅਤੇ ਮੁਫ਼ਤ ਬਿਜਲੀ।',
      descriptionHi: 'घर की छत पर 3 किलोवाट तक सोलर पैनल लगाने के लिए ₹78,000 तक की सीधी सरकारी सब्सिडी।',
      benefitAmountText: 'Up to ₹78,000 Direct Bank Subsidy (₹30,000 for 1kW, ₹60,000 for 2kW, ₹78,000 for 3kW+)',
      benefitType: 'Subsidy',
      minAge: 18,
      requiresPunjabDomicile: false,
      maxIncome: 1500000,
      applicationDeadline: 'Open Year-Round on National Rooftop Portal',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://pmsuryaghar.gov.in',
      officialPortalName: 'PM Surya Ghar Official National Portal',
      youtubeVideoId: 'PpozLw8TeVw',
      youtubeVideoTitle: 'PM Surya Ghar Muft Bijli Yojana ₹78,000 Rooftop Solar Subsidy Online Registration',
      requiredDocuments: [
        { nameEn: 'PSPCL Electricity Consumer Bill', namePa: 'ਪੀ.ਐਸ.ਪੀ.ਸੀ.ਐਲ ਬਿਜਲੀ ਦਾ ਬਿੱਲ', nameHi: 'पीएसपीसीएल बिजली बिल', issuingAuthority: 'PSPCL', availableOnDigiLocker: false },
        { nameEn: 'Aadhaar Card linked with Mobile', namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ', nameHi: 'आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true },
        { nameEn: 'Active Bank Passbook (NPCI mapped)', namePa: 'ਬੈਂਕ ਪਾਸਬੁੱਕ (NPCI ਮੈਪਡ)', nameHi: 'बैंक पासबुक', issuingAuthority: 'Bank', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Register with PSPCL Consumer Number',
          titlePa: 'ਬਿਜਲੀ ਖਾਤਾ ਨੰਬਰ ਨਾਲ ਰਜਿਸਟਰ ਕਰੋ',
          titleHi: 'बिजली उपभोक्ता संख्या के साथ पंजीकरण करें',
          descriptionEn: 'Apply on pmsuryaghar.gov.in selecting Punjab and PSPCL.',
          descriptionPa: 'pmsuryaghar.gov.in \'ਤੇ ਪੰਜਾਬ ਅਤੇ PSPCL ਚੁਣ ਕੇ ਅਰਜ਼ੀ ਦਿਓ।',
          descriptionHi: 'pmsuryaghar.gov.in पर पंजाब और PSPCL चुनकर आवेदन करें।'
        },
        {
          stepNumber: 2,
          titleEn: 'Net Meter Installation & ₹78,000 DBT Release',
          titlePa: 'ਨੈੱਟ ਮੀਟਰ ਅਤੇ ₹78,000 ਸਬਸਿਡੀ ਭੁਗਤਾਨ',
          titleHi: 'नेट मीटर और ₹78,000 सब्सिडी भुगतान',
          descriptionEn: 'Subsidy credited to bank account within 30 days of commissioning.',
          descriptionPa: 'ਸੋਲਰ ਲੱਗਣ ਤੋਂ 30 ਦਿਨਾਂ ਅੰਦਰ ₹78,000 ਸਿੱਧੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਆਉਂਦੇ ਹਨ।',
          descriptionHi: 'सोलर लगने के 30 दिनों के भीतर सब्सिडी सीधे बैंक खाते में जमा होती है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · MNRE & PEDA Gazette Notification 2026 (New Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-pmsuryaghar',
      title: 'PM Surya Ghar Rooftop Solar Subsidy Portal',
      url: 'https://pmsuryaghar.gov.in',
      description: 'Official national portal for ₹78,000 residential rooftop solar subsidy and PSPCL net-metering registration.',
      category: 'Energy & Subsidies',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'new',
    launchYear: '2025-26 (New)',
    scheme: {
      id: 'ai-pm-internship-scheme-2026',
      titleEn: 'Prime Minister Internship Scheme (PMIS) for Youth & Students',
      titlePa: 'ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਇੰਟਰਨਸ਼ਿਪ ਸਕੀਮ (PMIS) - ਵਿਦਿਆਰਥੀਆਂ ਅਤੇ ਨੌਜਵਾਨਾਂ ਲਈ',
      titleHi: 'प्रधानमंत्री इंटर्नशिप योजना (PMIS) - युवाओं और छात्रों के लिए',
      level: 'Central Government',
      departmentEn: 'Ministry of Corporate Affairs, Government of India',
      departmentPa: 'ਕਾਰਪੋਰੇਟ ਮਾਮਲੇ ਮੰਤਰਾਲਾ, ਭਾਰਤ ਸਰਕਾਰ',
      departmentHi: 'कॉर्पोरेट कार्य मंत्रालय, भारत सरकार',
      categoryTags: ['Students', 'Education', 'Youth', 'Jobs', 'New Scheme 2026', 'AI Admin Added'],
      descriptionEn: '12-month paid internship in India’s top 500 companies for students and youth aged 21–24 with ₹5,000/month stipend plus ₹6,000 one-time joining grant and insurance cover.',
      descriptionPa: 'ਦੇਸ਼ ਦੀਆਂ ਚੋਟੀ ਦੀਆਂ 500 ਕੰਪਨੀਆਂ ਵਿੱਚ ਨੌਜਵਾਨਾਂ ਅਤੇ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ₹5,000 ਪ੍ਰਤੀ ਮਹੀਨਾ ਭੱਤਾ + ₹6,000 ਇੱਕਮੁਸ਼ਤ ਗ੍ਰਾਂਟ ਸਮੇਤ 12 ਮਹੀਨਿਆਂ ਦੀ ਇੰਟਰਨਸ਼ਿਪ।',
      descriptionHi: 'देश की शीर्ष 500 कंपनियों में युवाओं और छात्रों के लिए ₹5,000 प्रतिमाह स्टाइपेंड और ₹6,000 एकमुश्त अनुदान के साथ 12 माह की इंटर्नशिप।',
      benefitAmountText: '₹5,000 / month Stipend + ₹6,000 Joining Grant (₹66,000 / year)',
      benefitType: 'Scholarship',
      minAge: 18,
      maxAge: 28,
      eligibleOccupations: ['Student', 'Unemployed Youth'],
      requiresPunjabDomicile: false,
      maxIncome: 800000,
      applicationDeadline: 'Rolling Batch Window on PMIS Portal',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://pminternship.mca.gov.in',
      officialPortalName: 'PM Internship Scheme Official Portal',
      youtubeVideoId: 'KuCBGB8UQ0A',
      youtubeVideoTitle: 'PM Internship Scheme ₹5,000/Month Stipend Online Registration on pminternship.mca.gov.in',
      requiredDocuments: [
        { nameEn: 'Aadhaar Card linked with Mobile', namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ', nameHi: 'आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true },
        { nameEn: '10th / 12th / ITI / Diploma / Degree Certificate', namePa: 'ਦਸਵੀਂ / ਬਾਰ੍ਹਵੀਂ / ਆਈ.ਟੀ.ਆਈ / ਡਿਗਰੀ ਸਰਟੀਫਿਕੇਟ', nameHi: 'शैक्षणिक प्रमाण पत्र', issuingAuthority: 'Board / University', availableOnDigiLocker: true },
        { nameEn: 'Active Bank Passbook (NPCI mapped)', namePa: 'ਬੈਂਕ ਪਾਸਬੁੱਕ (NPCI ਮੈਪਡ)', nameHi: 'बैंक पासबुक', issuingAuthority: 'Bank', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Create Youth Profile on pminternship.mca.gov.in',
          titlePa: 'pminternship.mca.gov.in \'ਤੇ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',
          titleHi: 'pminternship.mca.gov.in पर प्रोफ़ाइल बनाएं',
          descriptionEn: 'Complete e-KYC and auto-generate resume on the portal.',
          descriptionPa: 'ਆਧਾਰ ਈ-ਕੇਵਾਈਸੀ ਕਰਕੇ ਆਪਣਾ ਰੈਜ਼ਿਊਮੇ ਤਿਆਰ ਕਰੋ।',
          descriptionHi: 'आधार ई-केवाईसी पूरा करें और पोर्टल पर बायोडाटा बनाएं।'
        },
        {
          stepNumber: 2,
          titleEn: 'Select Up to 5 Internship Opportunities in Punjab/India',
          titlePa: 'ਪੰਜਾਬ ਵਿੱਚ 5 ਇੰਟਰਨਸ਼ਿਪ ਮੌਕਿਆਂ ਦੀ ਚੋਣ ਕਰੋ',
          titleHi: '5 इंटर्नशिप अवसरों का चयन करें',
          descriptionEn: 'Filter by district (Ludhiana, Mohali, Amritsar, Jalandhar) and apply free.',
          descriptionPa: 'ਆਪਣੇ ਜ਼ਿਲ੍ਹੇ ਅਨੁਸਾਰ ਕੰਪਨੀਆਂ ਚੁਣ ਕੇ ਮੁਫ਼ਤ ਅਪਲਾਈ ਕਰੋ।',
          descriptionHi: 'अपने जिले के अनुसार अवसर चुनें और निःशुल्क आवेदन करें।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Ministry of Corporate Affairs Notification 2026 (New Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-pminternship',
      title: 'PM Internship Scheme Portal (MCA)',
      url: 'https://pminternship.mca.gov.in',
      description: 'Official portal for ₹5,000/month paid internships + ₹6,000 grant for students, ITI, diploma, and degree youth.',
      category: 'Students & Education',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'new',
    launchYear: '2025-26 (New)',
    scheme: {
      id: 'ai-punjab-kisan-dsr-solar-2026',
      titleEn: 'Punjab Direct Seeding of Rice (DSR) & Solar Agriculture Pump Grant',
      titlePa: 'ਪੰਜਾਬ ਝੋਨੇ ਦੀ ਸਿੱਧੀ ਬਿਜਾਈ (DSR ₹1,500/ਏਕੜ) ਅਤੇ ਸੋਲਰ ਪੰਪ ਸਬਸਿਡੀ',
      titleHi: 'पंजाब धान की सीधी बुवाई (DSR ₹1,500/एकड़) एवं सोलर पंप सब्सिडी',
      level: 'Punjab State',
      departmentEn: 'Department of Agriculture & PEDA, Government of Punjab',
      departmentPa: 'ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ ਅਤੇ ਪੇਡਾ, ਪੰਜਾਬ ਸਰਕਾਰ',
      departmentHi: 'कृषि विभाग एवं पेडा, पंजाब सरकार',
      categoryTags: ['Farmers', 'Agriculture', 'Direct Benefit Transfer', 'Subsidy', 'New Scheme 2026', 'AI Admin Added'],
      descriptionEn: 'Provides ₹1,500 per acre direct cash incentive to Punjab farmers adopting groundwater-saving Direct Seeding of Rice (DSR) plus up to 80% subsidy on solar agricultural water pumps.',
      descriptionPa: 'ਪਾਣੀ ਬਚਾਉਣ ਵਾਲੀ ਝੋਨੇ ਦੀ ਸਿੱਧੀ ਬਿਜਾਈ (DSR) ਕਰਨ ਵਾਲੇ ਕਿਸਾਨਾਂ ਨੂੰ ₹1,500 ਪ੍ਰਤੀ ਏਕੜ ਨਕਦ ਸਹਾਇਤਾ ਅਤੇ ਸੋਲਰ ਪੰਪਾਂ \'ਤੇ 80% ਤੱਕ ਸਬਸਿਡੀ।',
      descriptionHi: 'धान की सीधी बुवाई (DSR) अपनाने वाले किसानों को ₹1,500 प्रति एकड़ प्रोत्साहन राशि और सोलर पंप पर 80% तक सब्सिडी।',
      benefitAmountText: '₹1,500 / acre Cash Transfer + up to 80% Solar Pump Subsidy',
      benefitType: 'Subsidy',
      minAge: 18,
      eligibleOccupations: ['Farmer', 'Agricultural Labourer'],
      requiresPunjabDomicile: true,
      maxLandholdingAcres: 25,
      applicationDeadline: 'Seasonal Portal Window on AgriPunjab & PEDA',
      deadlineType: 'Seasonal',
      officialPortalUrl: 'https://agrimachinerypb.com',
      officialPortalName: 'Agri Machinery & DSR Portal Punjab',
      youtubeVideoId: 'iz5UANmaAeE',
      youtubeVideoTitle: 'Punjab DSR ₹1,500/Acre Subsidy & PEDA Solar Pump Online Application Guide',
      requiredDocuments: [
        { nameEn: 'Aadhaar Card linked with Mobile', namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ', nameHi: 'आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true },
        { nameEn: 'Land Ownership / Tenancy Record (Fard)', namePa: 'ਜ਼ਮੀਨ ਦੀ ਫ਼ਰਦ / ਕਾਸ਼ਤਕਾਰ ਵੇਰਵਾ', nameHi: 'भूमि रिकॉर्ड (फ़र्द)', issuingAuthority: 'Revenue Department Punjab', availableOnDigiLocker: false },
        { nameEn: 'Active Bank Passbook (NPCI mapped)', namePa: 'ਬੈਂਕ ਪਾਸਬੁੱਕ (NPCI ਮੈਪਡ)', nameHi: 'बैंक पासबुक', issuingAuthority: 'Bank', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Register Khasra Numbers on AgriPunjab Portal',
          titlePa: 'ਖੇਤੀਬਾੜੀ ਪੋਰਟਲ \'ਤੇ ਖਸਰਾ ਨੰਬਰ ਦਰਜ ਕਰੋ',
          titleHi: 'कृषि पोर्टल पर खसरा नंबर दर्ज करें',
          descriptionEn: 'Submit sown acreage details online with Aadhaar authentication.',
          descriptionPa: 'ਆਧਾਰ ਰਾਹੀਂ ਬੀਜੇ ਗਏ ਰਕਬੇ ਦਾ ਵੇਰਵਾ ਆਨਲਾਈਨ ਦਰਜ ਕਰੋ।',
          descriptionHi: 'आधार प्रमाणीकरण के साथ बोए गए क्षेत्र का विवरण दर्ज करें।'
        },
        {
          stepNumber: 2,
          titleEn: 'Field Verification & Direct Bank Credit',
          titlePa: 'ਖੇਤ ਪੜਤਾਲ ਅਤੇ ਸਿੱਧਾ ਬੈਂਕ ਭੁਗਤਾਨ',
          titleHi: 'भौतिक सत्यापन और बैंक भुगतान',
          descriptionEn: '₹1,500/acre transferred directly via DBT after agriculture officer verification.',
          descriptionPa: 'ਖੇਤੀਬਾੜੀ ਅਫ਼ਸਰ ਦੀ ਤਸਦੀਕ ਤੋਂ ਬਾਅਦ ₹1,500 ਪ੍ਰਤੀ ਏਕੜ ਖਾਤੇ ਵਿੱਚ ਆਉਂਦੇ ਹਨ।',
          descriptionHi: 'सत्यापन के बाद ₹1,500 प्रति एकड़ सीधे बैंक खाते में ट्रांसफर किए जाते हैं।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Dept of Agriculture Punjab Notification 2026 (New Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-peda-punjab',
      title: 'PEDA Punjab Solar Pump & Renewable Energy Portal',
      url: 'https://www.peda.gov.in',
      description: 'Punjab Energy Development Agency portal for PM-KUSUM solar agricultural pumps and renewable energy subsidies.',
      category: 'Agriculture & Farmers',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'new',
    launchYear: '2025-26 (New)',
    scheme: {
      id: 'ai-lakhpati-didi-drone-didi-2026',
      titleEn: 'PM Lakhpati Didi & Namo Drone Didi Women SHG Empowerment Scheme',
      titlePa: 'ਪੀ.ਐਮ ਲਖਪਤੀ ਦੀਦੀ ਅਤੇ ਨਮੋ ਡਰੋਨ ਦੀਦੀ ਮਹਿਲਾ ਸਵੈ-ਸਹਾਇਤਾ ਸਕੀਮ',
      titleHi: 'पीएम लखपति दीदी एवं नमो ड्रोन दीदी महिला स्वयं सहायता योजना',
      level: 'Central Government',
      departmentEn: 'Ministry of Rural Development & PSRLM (Aajeevika Punjab)',
      departmentPa: 'ਪੇਂਡੂ ਵਿਕਾਸ ਮੰਤਰਾਲਾ ਅਤੇ ਪੰਜਾਬ ਰਾਜ ਗ੍ਰਾਮੀਣ ਆਜੀਵਿਕਾ ਮਿਸ਼ਨ',
      departmentHi: 'ग्रामीण विकास मंत्रालय एवं पंजाब राज्य ग्रामीण आजीविका मिशन',
      categoryTags: ['Women', 'Self-Employed', 'Agriculture', 'Subsidy', 'New Scheme 2026', 'AI Admin Added'],
      descriptionEn: 'Empowers women Self-Help Group (SHG) members in Punjab with up to ₹5 Lakh interest-free revolving enterprise credit, free drone pilot certification, and 80% subsidy (up to ₹8 Lakh) on agricultural spray drones.',
      descriptionPa: 'ਪੰਜਾਬ ਦੀਆਂ ਮਹਿਲਾ ਸਵੈ-ਸਹਾਇਤਾ ਸਮੂਹਾਂ (SHG) ਨੂੰ ₹5 ਲੱਖ ਤੱਕ ਵਿਆਜ-ਮੁਕਤ ਕਰਜ਼ਾ, ਮੁਫ਼ਤ ਡਰੋਨ ਪਾਇਲਟ ਟ੍ਰੇਨਿੰਗ ਅਤੇ ਖੇਤੀਬਾੜੀ ਡਰੋਨ ਤੇ 80% ਸਬਸਿਡੀ।',
      descriptionHi: 'महिला स्वयं सहायता समूहों (SHG) को ₹5 लाख तक का ऋण, मुफ्त ड्रोन पायलट प्रशिक्षण और कृषि ड्रोन पर 80% सब्सिडी।',
      benefitAmountText: 'Up to ₹5,00,000 SHG Enterprise Credit + 80% Agricultural Drone Subsidy (up to ₹8 Lakh)',
      benefitType: 'Subsidy',
      minAge: 18,
      maxAge: 60,
      targetGenders: ['Female'],
      requiresPunjabDomicile: false,
      maxIncome: 300000,
      applicationDeadline: 'Open Across All Block Mission Management Units (PSRLM)',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://lakhpatididi.gov.in',
      officialPortalName: 'Lakhpati Didi Official Portal',
      youtubeVideoId: 'CzxKFDWaFY8',
      youtubeVideoTitle: 'PM Lakhpati Didi & Namo Drone Didi Yojana Online Registration & SHG Benefits',
      requiredDocuments: [
        { nameEn: 'Aadhaar Card linked with Mobile Number', namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ', nameHi: 'आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true },
        { nameEn: 'Self-Help Group (SHG) Membership Passbook / ID', namePa: 'ਸਵੈ-ਸਹਾਇਤਾ ਸਮੂਹ (SHG) ਮੈਂਬਰਸ਼ਿਪ ਕਾਰਡ', nameHi: 'स्वयं सहायता समूह (SHG) पहचान पत्र', issuingAuthority: 'PSRLM / NRLM Block Office', availableOnDigiLocker: false },
        { nameEn: 'Active Savings Bank Account', namePa: 'ਬੈਂਕ ਖਾਤਾ ਪਾਸਬੁੱਕ', nameHi: 'बैंक पासबुक', issuingAuthority: 'Bank', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Enroll with Local Village Aajeevika SHG / Block Office',
          titlePa: 'ਪਿੰਡ ਦੇ ਆਜੀਵਿਕਾ ਸਵੈ-ਸਹਾਇਤਾ ਸਮੂਹ (SHG) ਨਾਲ ਜੁੜੋ',
          titleHi: 'ग्राम आजीविका स्वयं सहायता समूह (SHG) में पंजीकरण करें',
          descriptionEn: 'Register on lakhpatididi.gov.in or via Block Development Officer (BDO).',
          descriptionPa: 'lakhpatididi.gov.in ਜਾਂ ਬੀ.ਡੀ.ਓ ਦਫ਼ਤਰ ਰਾਹੀਂ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਕਰੋ।',
          descriptionHi: 'lakhpatididi.gov.in या बीडीओ कार्यालय के माध्यम से पंजीकरण करें।'
        },
        {
          stepNumber: 2,
          titleEn: 'Skill Training, Drone Pilot License & Credit Release',
          titlePa: 'ਟ੍ਰੇਨਿੰਗ, ਡਰੋਨ ਲਾਇਸੈਂਸ ਅਤੇ ਬੈਂਕ ਗ੍ਰਾਂਟ ਜਾਰੀ',
          titleHi: 'प्रशिक्षण, ड्रोन लाइसेंस और बैंक अनुदान वितरण',
          descriptionEn: 'Receive 15-day drone/enterprise training and direct bank credit.',
          descriptionPa: '15 ਦਿਨਾਂ ਦੀ ਮੁਫ਼ਤ ਟ੍ਰੇਨਿੰਗ ਤੋਂ ਬਾਅਦ ਸਿੱਧੀ ਗ੍ਰਾਂਟ ਜਾਰੀ ਹੁੰਦੀ ਹੈ।',
          descriptionHi: '15 दिवसीय प्रशिक्षण के बाद सीधे बैंक खाते में सहायता जारी होती है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Ministry of Rural Development Notification 2026 (New Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-lakhpatididi',
      title: 'PM Lakhpati Didi & NRLM Aajeevika Portal',
      url: 'https://lakhpatididi.gov.in',
      description: 'Official Ministry of Rural Development portal for women SHG livelihood grants and Namo Drone Didi subsidies.',
      category: 'Women & Social Welfare',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'new',
    launchYear: '2025-26 (New)',
    scheme: {
      id: 'ai-ayushman-vay-vandana-70plus-2026',
      titleEn: 'Ayushman Vay Vandana Card for All Senior Citizens Aged 70+ (No Income Limit)',
      titlePa: 'ਆਯੁਸ਼ਮਾਨ ਵਯ ਵੰਦਨਾ ਕਾਰਡ - 70+ ਸਾਲ ਦੇ ਸਾਰੇ ਬਜ਼ੁਰਗਾਂ ਲਈ ₹5 ਲੱਖ ਮੁਫ਼ਤ ਇਲਾਜ',
      titleHi: 'आयुष्मान वय वंदना कार्ड - 70+ वर्ष के सभी वरिष्ठ नागरिकों के लिए ₹5 लाख मुफ्त इलाज',
      level: 'Central Government',
      departmentEn: 'National Health Authority (NHA) & Health Department Punjab',
      departmentPa: 'ਰਾਸ਼ਟਰੀ ਸਿਹਤ ਅਥਾਰਟੀ ਅਤੇ ਸਿਹਤ ਵਿਭਾਗ ਪੰਜਾਬ',
      departmentHi: 'राष्ट्रीय स्वास्थ्य प्राधिकरण एवं स्वास्थ्य विभाग पंजाब',
      categoryTags: ['Senior Citizens', 'Health', 'Cashless Hospitalization', 'New Scheme 2026', 'AI Admin Added'],
      descriptionEn: 'Universal ₹5 Lakh per year cashless hospitalization cover for every senior citizen aged 70 years and above, regardless of income, pension, or tax status, valid across all Ayushman-empanelled private and government hospitals.',
      descriptionPa: '70 ਸਾਲ ਜਾਂ ਇਸ ਤੋਂ ਵੱਧ ਉਮਰ ਦੇ ਹਰ ਬਜ਼ੁਰਗ ਨਾਗਰਿਕ ਲਈ (ਭਾਵੇਂ ਆਮਦਨ ਜਾਂ ਪੈਨਸ਼ਨ ਕਿੰਨੀ ਵੀ ਹੋਵੇ) ਹਰ ਸਾਲ ₹5 ਲੱਖ ਤੱਕ ਦਾ ਬਿਲਕੁਲ ਮੁਫ਼ਤ ਕੈਸ਼ਲੈੱਸ ਇਲਾਜ।',
      descriptionHi: '70 वर्ष और उससे अधिक आयु के प्रत्येक वरिष्ठ नागरिक के लिए (आय की परवाह किए बिना) ₹5 लाख प्रति वर्ष का मुफ्त कैशलेस इलाज।',
      benefitAmountText: '₹5,00,000 / year Universal Senior Citizen Cashless Health Cover (Zero Income Limit)',
      benefitType: 'Health Cover',
      minAge: 70,
      requiresPunjabDomicile: false,
      applicationDeadline: 'Instant Online Self-eKYC on beneficiary.nha.gov.in & Ayushman App',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://beneficiary.nha.gov.in',
      officialPortalName: 'NHA Ayushman Vay Vandana Portal',
      youtubeVideoId: 'RAngSOTyGHY',
      youtubeVideoTitle: 'Ayushman Vay Vandana Card 70+ Senior Citizen Online Apply & Download Process',
      requiredDocuments: [
        { nameEn: 'Aadhaar Card proving age 70 years or above', namePa: '70+ ਸਾਲ ਉਮਰ ਵਾਲਾ ਆਧਾਰ ਕਾਰਡ', nameHi: '70+ वर्ष आयु प्रमाणित आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Click "70+ Senior Citizen Enroll" on beneficiary.nha.gov.in',
          titlePa: 'beneficiary.nha.gov.in ਤੇ 70+ Senior Citizen ਬਟਨ ਦਬਾਓ',
          titleHi: 'beneficiary.nha.gov.in पर 70+ वरिष्ठ नागरिक पंजीकरण चुनें',
          descriptionEn: 'Only Aadhaar OTP or Face Auth is required; no income certificate needed.',
          descriptionPa: 'ਸਿਰਫ਼ ਆਧਾਰ OTP ਦੀ ਲੋੜ ਹੈ, ਕਿਸੇ ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ ਦੀ ਲੋੜ ਨਹੀਂ।',
          descriptionHi: 'केवल आधार ओटीपी आवश्यक है; किसी आय प्रमाण पत्र की आवश्यकता नहीं।'
        },
        {
          stepNumber: 2,
          titleEn: 'Download Ayushman Vay Vandana Card Instantly',
          titlePa: 'ਆਪਣਾ ਵਯ ਵੰਦਨਾ ਕਾਰਡ ਤੁਰੰਤ ਡਾਊਨਲੋਡ ਕਰੋ',
          titleHi: 'तुरंत अपना आयुष्मान वय वंदना कार्ड डाउनलोड करें',
          descriptionEn: 'Coverage starts from Day 1 with zero waiting period for pre-existing diseases.',
          descriptionPa: 'ਪਹਿਲੇ ਦਿਨ ਤੋਂ ਹੀ ਸਾਰੀਆਂ ਪੁਰਾਣੀਆਂ ਬਿਮਾਰੀਆਂ ਦਾ ਮੁਫ਼ਤ ਇਲਾਜ ਸ਼ੁਰੂ।',
          descriptionHi: 'पहले दिन से ही पूर्व-मौजूदा बीमारियों सहित मुफ्त इलाज शुरू।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · National Health Authority (NHA) Notification 2026 (New Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-nha-beneficiary',
      title: 'Ayushman Bharat NHA Beneficiary & Vay Vandana Portal',
      url: 'https://beneficiary.nha.gov.in',
      description: 'Official NHA self-registration portal to download Ayushman Golden Cards and 70+ Senior Citizen Vay Vandana Cards.',
      category: 'Health & Medical',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'new',
    launchYear: '2025-26 (New)',
    scheme: {
      id: 'ai-punjab-aam-aadmi-clinic-2026',
      titleEn: 'Punjab Aam Aadmi Clinics (80 Free Medicines & 38 Free Diagnostic Lab Tests)',
      titlePa: 'ਪੰਜਾਬ ਆਮ ਆਦਮੀ ਕਲੀਨਿਕ (80 ਮੁਫ਼ਤ ਦਵਾਈਆਂ ਅਤੇ 38 ਮੁਫ਼ਤ ਲੈਬ ਟੈਸਟ ਸਕੀਮ)',
      titleHi: 'पंजाब आम आदमी क्लिनिक (80 मुफ्त दवाइयां एवं 38 मुफ्त लैब टेस्ट योजना)',
      level: 'Punjab State',
      departmentEn: 'Department of Health & Family Welfare, Government of Punjab',
      departmentPa: 'ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਵਿਭਾਗ, ਪੰਜਾਬ ਸਰਕਾਰ',
      departmentHi: 'स्वास्थ्य एवं परिवार कल्याण विभाग, पंजाब सरकार',
      categoryTags: ['Health', 'Universal Care', 'New Scheme 2026', 'AI Admin Added'],
      descriptionEn: 'Provides completely free outpatient doctor consultations, 80 essential medicines free of cost, and 38 free clinical diagnostic blood/urine tests across 880+ Aam Aadmi Clinics across urban and rural Punjab.',
      descriptionPa: 'ਪੰਜਾਬ ਦੇ 880+ ਆਮ ਆਦਮੀ ਕਲੀਨਿਕਾਂ ਵਿੱਚ ਹਰ ਨਾਗਰਿਕ ਲਈ ਬਿਲਕੁਲ ਮੁਫ਼ਤ ਡਾਕਟਰੀ ਸਲਾਹ, 80 ਜ਼ਰੂਰੀ ਦਵਾਈਆਂ ਅਤੇ 38 ਲੈਬ ਟੈਸਟ ਮੁਫ਼ਤ।',
      descriptionHi: 'पंजाब के 880+ आम आदमी क्लीनिकों में प्रत्येक नागरिक के लिए मुफ्त डॉक्टर परामर्श, 80 आवश्यक दवाइयां और 38 लैब टेस्ट।',
      benefitAmountText: '100% Free Doctor Consultation + 80 Free Medicines + 38 Free Lab Tests',
      benefitType: 'Health Cover',
      minAge: 0,
      requiresPunjabDomicile: true,
      applicationDeadline: 'Walk-in Daily (8:00 AM to 2:00 PM) at Nearest Aam Aadmi Clinic',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://health.punjab.gov.in',
      officialPortalName: 'Department of Health Punjab',
      youtubeVideoId: 'G1wT_u69e_k',
      youtubeVideoTitle: 'Punjab Aam Aadmi Clinic Free 38 Diagnostic Tests & Medicines Complete Guide',
      requiredDocuments: [
        { nameEn: 'Mobile Number or Aadhaar Card for Digital Patient Slip', namePa: 'ਮੋਬਾਈਲ ਨੰਬਰ ਜਾਂ ਆਧਾਰ ਕਾਰਡ (ਡਿਜੀਟਲ ਪਰਚੀ ਲਈ)', nameHi: 'मोबाइल नंबर या आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Visit Nearest Mohalla / Village Aam Aadmi Clinic',
          titlePa: 'ਆਪਣੇ ਨੇੜਲੇ ਆਮ ਆਦਮੀ ਕਲੀਨਿਕ ਵਿਖੇ ਜਾਓ',
          titleHi: 'अपने नजदीकी आम आदमी क्लिनिक पर जाएं',
          descriptionEn: 'Paperless tablet registration at reception with zero OPD fee.',
          descriptionPa: 'ਬਿਨਾਂ ਕਿਸੇ ਪਰਚੀ ਫੀਸ ਦੇ ਟੈਬਲੇਟ ਰਾਹੀਂ ਤੁਰੰਤ ਰਜਿਸਟ੍ਰੇਸ਼ਨ।',
          descriptionHi: 'बिना किसी ओपीडी शुल्क के टैबलेट द्वारा तुरंत पंजीकरण।'
        },
        {
          stepNumber: 2,
          titleEn: 'Receive Free Medicines & SMS Lab Reports',
          titlePa: 'ਮੁਫ਼ਤ ਦਵਾਈਆਂ ਅਤੇ ਮੋਬਾਈਲ ਤੇ ਲੈਬ ਰਿਪੋਰਟ ਪ੍ਰਾਪਤ ਕਰੋ',
          titleHi: 'मुफ्त दवाइयां और मोबाइल पर लैब रिपोर्ट प्राप्त करें',
          descriptionEn: 'Diagnostic test reports are sent directly to your phone via SMS/WhatsApp.',
          descriptionPa: 'ਖੂਨ ਅਤੇ ਹੋਰ ਟੈਸਟਾਂ ਦੀਆਂ ਰਿਪੋਰਟਾਂ ਸਿੱਧੀਆਂ ਮੋਬਾਈਲ ਤੇ ਆਉਂਦੀਆਂ ਹਨ।',
          descriptionHi: 'जांच रिपोर्ट सीधे आपके मोबाइल फोन पर भेजी जाती हैं।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Dept of Health & Family Welfare Punjab (New Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-health-punjab-clinics',
      title: 'Punjab Health Department & Aam Aadmi Clinics Portal',
      url: 'https://health.punjab.gov.in',
      description: 'Official Punjab Health portal for 880+ Aam Aadmi Clinics, Mukh Mantri Cancer Rahat Kosh, and public hospitals.',
      category: 'Health & Medical',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'new',
    launchYear: '2025-26 (New)',
    scheme: {
      id: 'ai-punjab-doorstep-delivery-1076',
      titleEn: 'Bhagwant Mann Sarkar Tuhade Dwar (1076 Doorstep Delivery of 43 Govt Services)',
      titlePa: 'ਭਗਵੰਤ ਮਾਨ ਸਰਕਾਰ ਤੁਹਾਡੇ ਦੁਆਰ (1076 ਹੈਲਪਲਾਈਨ ਰਾਹੀਂ ਘਰ ਬੈਠੇ 43 ਸਰਕਾਰੀ ਸੇਵਾਵਾਂ)',
      titleHi: 'भगवंत मान सरकार तुहाडे द्वार (1076 हेल्पलाइन द्वारा घर बैठे 43 सरकारी सेवाएं)',
      level: 'Punjab State',
      departmentEn: 'Department of Governance Reforms & Public Grievances, Punjab',
      departmentPa: 'ਪ੍ਰਸ਼ਾਸਨਿਕ ਸੁਧਾਰ ਅਤੇ ਜਨ ਸ਼ਿਕਾਇਤ ਵਿਭਾਗ, ਪੰਜਾਬ',
      departmentHi: 'प्रशासनिक सुधार एवं लोक शिकायत विभाग, पंजाब',
      categoryTags: ['Citizen e-Services', 'Senior Citizens', 'Women', 'Students', 'New Scheme 2026', 'AI Admin Added'],
      descriptionEn: 'Dial 1076 to book a Mobile Sahayak to visit your home at your preferred time for 43 government services including Birth/Death, Income, Caste (SC/BC), Residence/Domicile, Old Age/Widow/Disability Pension, and Shagun applications.',
      descriptionPa: 'ਹੁਣ ਸੇਵਾ ਕੇਂਦਰ ਜਾਣ ਦੀ ਲੋੜ ਨਹੀਂ—1076 ਤੇ ਕਾਲ ਕਰਕੇ ਜਨਮ/ਮੌਤ, ਆਮਦਨ, ਜਾਤੀ (SC/BC), ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਪੈਨਸ਼ਨ ਸਮੇਤ 43 ਸਰਕਾਰੀ ਸੇਵਾਵਾਂ ਘਰ ਬੈਠੇ ਪ੍ਰਾਪਤ ਕਰੋ।',
      descriptionHi: '1076 पर कॉल कर जन्म/मृत्यु, आय, जाति, निवास प्रमाण पत्र और पेंशन सहित 43 सरकारी सेवाएं घर बैठे प्राप्त करें।',
      benefitAmountText: '43 Official Certificates & Pensions Delivered at Home (Dial 1076)',
      benefitType: 'In-Kind/Ration',
      minAge: 0,
      requiresPunjabDomicile: true,
      applicationDeadline: 'Call 1076 Anytime (8:00 AM – 8:00 PM Daily) or Book on connect.punjab.gov.in',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://esewa.punjab.gov.in',
      officialPortalName: 'e-Sewa Punjab 1076 Doorstep Portal',
      youtubeVideoId: 'n18kQ12z7rI',
      youtubeVideoTitle: 'Punjab 1076 Doorstep Delivery Scheme: How to Book 43 Sewa Kendra Services at Home',
      requiredDocuments: [
        { nameEn: 'Aadhaar Card linked with Mobile Number', namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ', nameHi: 'मोबाइल से जुड़ा आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Dial Helpline 1076 & Choose Time Slot',
          titlePa: '1076 ਨੰਬਰ ਤੇ ਕਾਲ ਕਰੋ ਅਤੇ ਸਮਾਂ ਚੁਣੋ',
          titleHi: '1076 नंबर पर कॉल करें और समय स्लॉट चुनें',
          descriptionEn: 'Operator tells you required documents and books a home visit.',
          descriptionPa: 'ਆਪਣੀ ਸਹੂਲਤ ਅਨੁਸਾਰ ਮੋਬਾਈਲ ਸਹਾਇਕ ਨੂੰ ਘਰ ਬੁਲਾਉਣ ਦਾ ਸਮਾਂ ਤੈਅ ਕਰੋ।',
          descriptionHi: 'अपनी सुविधा के अनुसार मोबाइल सहायक को घर बुलाने का समय चुनें।'
        },
        {
          stepNumber: 2,
          titleEn: 'Biometrics at Home & Digital Certificate Delivery',
          titlePa: 'ਘਰ ਬੈਠੇ ਫੋਟੋ/ਬਾਇਓਮੈਟ੍ਰਿਕ ਅਤੇ ਸਰਟੀਫਿਕੇਟ ਡਿਲੀਵਰੀ',
          titleHi: 'घर बैठे बायोमेट्रिक और प्रमाण पत्र वितरण',
          descriptionEn: 'Signed certificate delivered via SMS link and speed post.',
          descriptionPa: 'ਸਰਟੀਫਿਕੇਟ ਮੋਬਾਈਲ ਤੇ ਅਤੇ ਡਾਕ ਰਾਹੀਂ ਘਰ ਪਹੁੰਚਾਇਆ ਜਾਂਦਾ ਹੈ।',
          descriptionHi: 'प्रमाण पत्र एसएमएस लिंक और डाक द्वारा घर पहुंचाया जाता है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Dept of Governance Reforms Punjab Notification (New Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-esewa-1076-punjab',
      title: 'e-Sewa Punjab & 1076 Doorstep Services Portal',
      url: 'https://esewa.punjab.gov.in',
      description: 'Official Punjab e-Sewa portal to track certificate status and book 1076 doorstep delivery for 43 citizen services.',
      category: 'Citizen e-Services',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'new',
    launchYear: '2025-26 (New)',
    scheme: {
      id: 'ai-punjab-udan-mahila-health-2026',
      titleEn: 'Punjab UDAAN & Mahila Swasthya Self-Employment Welfare Scheme',
      titlePa: 'ਪੰਜਾਬ ਉਡਾਣ (UDAAN) ਅਤੇ ਮਹਿਲਾ ਸਿਹਤ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਭਲਾਈ ਸਕੀਮ',
      titleHi: 'पंजाब उड़ान (UDAAN) एवं महिला स्वास्थ्य स्वरोजगार कल्याण योजना',
      level: 'Punjab State',
      departmentEn: 'Department of Social Security, Women & Child Development, Punjab',
      departmentPa: 'ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ, ਇਸਤਰੀ ਅਤੇ ਬਾਲ ਵਿਕਾਸ ਵਿਭਾਗ, ਪੰਜਾਬ',
      departmentHi: 'सामाजिक सुरक्षा, महिला एवं बाल विकास विभाग, पंजाब',
      categoryTags: ['Women', 'Students', 'Health', 'New Scheme 2026', 'AI Admin Added'],
      descriptionEn: 'Provides monthly free sanitary hygiene kits through 27,314 Anganwadi centres across Punjab along with ₹15,000 vocational tailoring/computer micro-grant for women and girl students.',
      descriptionPa: 'ਪੰਜਾਬ ਦੇ 27,314 ਆਂਗਣਵਾੜੀ ਕੇਂਦਰਾਂ ਰਾਹੀਂ ਮਹਿਲਾਵਾਂ ਅਤੇ ਵਿਦਿਆਰਥਣਾਂ ਨੂੰ ਮੁਫ਼ਤ ਸਿਹਤ ਕਿੱਟਾਂ ਅਤੇ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਲਈ ₹15,000 ਦੀ ਵਿਸ਼ੇਸ਼ ਗ੍ਰਾਂਟ।',
      descriptionHi: 'पंजाब के 27,314 आंगनवाड़ी केंद्रों के माध्यम से महिलाओं एवं छात्राओं को मुफ्त स्वास्थ्य किट और ₹15,000 स्वरोजगार अनुदान।',
      benefitAmountText: 'Free Monthly Hygiene Kits + ₹15,000 Women Vocational Micro-Grant',
      benefitType: 'Direct Cash Transfer',
      minAge: 12,
      maxAge: 55,
      targetGenders: ['Female'],
      requiresPunjabDomicile: true,
      maxIncome: 250000,
      applicationDeadline: 'Continuous Distribution at All Punjab Anganwadi & Sewa Kendras',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://sswcd.punjab.gov.in',
      officialPortalName: 'Women & Child Development Punjab',
      youtubeVideoId: 'v2avonSHyFU',
      youtubeVideoTitle: 'Punjab Udaan Scheme for Women & Girl Students Registration & Benefits Guide',
      requiredDocuments: [
        { nameEn: 'Aadhaar Card or School/College ID Card', namePa: 'ਆਧਾਰ ਕਾਰਡ ਜਾਂ ਸਕੂਲ/ਕਾਲਜ ਕਾਰਡ', nameHi: 'आधार कार्ड या स्कूल पहचान पत्र', issuingAuthority: 'UIDAI / Institution', availableOnDigiLocker: true },
        { nameEn: 'Punjab Residence Proof', namePa: 'ਪੰਜਾਬ ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ', nameHi: 'पंजाब निवास प्रमाण पत्र', issuingAuthority: 'Tehsildar / Sewa Kendra', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Register at Nearest Anganwadi Centre or Sewa Kendra',
          titlePa: 'ਆਪਣੇ ਨੇੜਲੇ ਆਂਗਣਵਾੜੀ ਕੇਂਦਰ ਜਾਂ ਸੇਵਾ ਕੇਂਦਰ ਵਿਖੇ ਨਾਂ ਦਰਜ ਕਰਵਾਓ',
          titleHi: 'नजदीकी आंगनवाड़ी केंद्र या सेवा केंद्र पर पंजीकरण कराएं',
          descriptionEn: 'Anganwadi worker records Aadhaar number for monthly entitlement.',
          descriptionPa: 'ਆਂਗਣਵਾੜੀ ਵਰਕਰ ਵੱਲੋਂ ਆਧਾਰ ਨੰਬਰ ਦਰਜ ਕਰਕੇ ਤੁਰੰਤ ਲਾਭ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ।',
          descriptionHi: 'आंगनवाड़ी कार्यकर्ता द्वारा आधार नंबर दर्ज कर लाभ दिया जाता है।'
        },
        {
          stepNumber: 2,
          titleEn: 'Apply for Vocational Skill Grant via District CDPO Office',
          titlePa: 'ਸੀ.ਡੀ.ਪੀ.ਓ ਦਫ਼ਤਰ ਰਾਹੀਂ ₹15,000 ਸਵੈ-ਰੁਜ਼ਗਾਰ ਗ੍ਰਾਂਟ ਲਈ ਅਪਲਾਈ ਕਰੋ',
          titleHi: 'सीडीपीओ कार्यालय के माध्यम से ₹15,000 अनुदान हेतु आवेदन करें',
          descriptionEn: 'Direct transfer to woman applicant’s Aadhaar-seeded bank account.',
          descriptionPa: 'ਗ੍ਰਾਂਟ ਦੀ ਰਕਮ ਸਿੱਧੀ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਭੇਜੀ ਜਾਂਦੀ ਹੈ।',
          descriptionHi: 'अनुदान राशि सीधे महिला आवेदक के बैंक खाते में भेजी जाती है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Dept of Social Security & WCD Punjab Notification 2026',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-udan-wcd-punjab',
      title: 'Punjab UDAAN & Women Welfare Portal (SSWCD)',
      url: 'https://sswcd.punjab.gov.in',
      description: 'Department of Social Security and Women & Child Development Punjab official portal for UDAAN and women empowerment grants.',
      category: 'Women & Social Welfare',
      createdAt: new Date().toISOString()
    }
  },
  // ==================== PURANI / CLASSIC ESTABLISHED SCHEMES (ਪੁਰਾਣੀਆਂ ਪ੍ਰਮੁੱਖ ਸਕੀਮਾਂ) ====================
  {
    era: 'purani',
    launchYear: 'Classic Scheme (Purani)',
    scheme: {
      id: 'ai-purani-pmegp-msme-subsidy',
      titleEn: 'Prime Minister Employment Generation Programme (PMEGP 35% Subsidy Loan)',
      titlePa: 'ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਰੋਜ਼ਗਾਰ ਉਤਪੱਤੀ ਪ੍ਰੋਗਰਾਮ (PMEGP - 35% ਸਬਸਿਡੀ ਵਾਲਾ ਵਪਾਰਕ ਕਰਜ਼ਾ)',
      titleHi: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP - 35% सब्सिडी व्यावसायिक ऋण)',
      level: 'Central Government',
      departmentEn: 'Ministry of MSME & Khadi and Village Industries Commission (KVIC Punjab)',
      departmentPa: 'ਐਮ.ਐਸ.ਐਮ.ਈ ਮੰਤਰਾਲਾ ਅਤੇ ਖਾਦੀ ਗ੍ਰਾਮੋਦਯੋਗ ਕਮਿਸ਼ਨ (KVIC ਪੰਜਾਬ)',
      departmentHi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय एवं खादी ग्रामोद्योग आयोग',
      categoryTags: ['Self-Employed', 'Youth', 'Loan/Credit', 'Subsidy', 'Purani / Classic Scheme', 'AI Admin Added'],
      descriptionEn: 'Long-standing credit-linked capital subsidy up to 35% in rural Punjab (25% in urban areas) on project cost up to ₹50 Lakh for manufacturing units and ₹20 Lakh for service/trading businesses.',
      descriptionPa: 'ਪਿੰਡਾਂ ਵਿੱਚ ਨਵਾਂ ਕਾਰੋਬਾਰ, ਫੈਕਟਰੀ ਜਾਂ ਦੁਕਾਨ ਖੋਲ੍ਹਣ ਲਈ ₹50 ਲੱਖ ਤੱਕ ਦੇ ਪ੍ਰੋਜੈਕਟ ਤੇ 35% ਤੱਕ ਦੀ ਸਿੱਧੀ ਸਰਕਾਰੀ ਸਬਸਿਡੀ (ਸ਼ਹਿਰਾਂ ਵਿੱਚ 25% ਸਬਸਿਡੀ)।',
      descriptionHi: 'ग्रामीण क्षेत्रों में नया उद्योग या सेवा व्यवसाय शुरू करने के लिए ₹50 लाख तक की परियोजना पर 35% तक सीधी सरकारी सब्सिडी।',
      benefitAmountText: '25% to 35% Direct Capital Subsidy (up to ₹17.50 Lakh Grant on ₹50 Lakh Project)',
      benefitType: 'Subsidy',
      minAge: 18,
      maxAge: 60,
      eligibleOccupations: ['Unemployed Youth', 'Self-Employed/Shopkeeper', 'Artisan/Craftsperson', 'Student'],
      requiresPunjabDomicile: false,
      applicationDeadline: 'Open Year-Round on KVIC PMEGP e-Portal',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://www.kviconline.gov.in/pmegpeportal',
      officialPortalName: 'KVIC PMEGP Official e-Portal',
      youtubeVideoId: 'EoqsjrESKaU',
      youtubeVideoTitle: 'PMEGP Loan 35% Subsidy Online Apply Process, Project Report & EDP Training Guide',
      requiredDocuments: [
        { nameEn: 'Aadhaar Card & PAN Card', namePa: 'ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਪੈਨ ਕਾਰਡ', nameHi: 'आधार कार्ड और पैन कार्ड', issuingAuthority: 'UIDAI / Income Tax Dept', availableOnDigiLocker: true },
        { nameEn: '8th / 10th / 12th Educational Certificate (for projects > ₹10 Lakh)', namePa: 'ਅੱਠਵੀਂ / ਦਸਵੀਂ / ਬਾਰ੍ਹਵੀਂ ਸਰਟੀਫਿਕੇਟ', nameHi: 'शैक्षणिक योग्यता प्रमाण पत्र', issuingAuthority: 'School Board', availableOnDigiLocker: true },
        { nameEn: 'Rural Area Certificate & Project Summary', namePa: 'ਪੇਂਡੂ ਖੇਤਰ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਪ੍ਰੋਜੈਕਟ ਰਿਪੋਰਟ', nameHi: 'ग्रामीण क्षेत्र प्रमाण पत्र और प्रोजेक्ट रिपोर्ट', issuingAuthority: 'Patwari / Applicant', availableOnDigiLocker: false }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Fill Online PMEGP Application on kviconline.gov.in',
          titlePa: 'kviconline.gov.in ਤੇ PMEGP ਆਨਲਾਈਨ ਫਾਰਮ ਭਰੋ',
          titleHi: 'kviconline.gov.in पर पीएमईजीपी ऑनलाइन फॉर्म भरें',
          descriptionEn: 'Select KVIC, KVIB Punjab, or District Industries Centre (DIC) as implementing agency.',
          descriptionPa: 'KVIC, ਪੰਜਾਬ ਖਾਦੀ ਬੋਰਡ ਜਾਂ ਜ਼ਿਲ੍ਹਾ ਉਦਯੋਗ ਕੇਂਦਰ (DIC) ਚੁਣੋ।',
          descriptionHi: 'केवीआईसी, खादी बोर्ड या जिला उद्योग केंद्र (DIC) चुनें।'
        },
        {
          stepNumber: 2,
          titleEn: 'Complete Online EDP Training & Claim 35% Margin Money Subsidy',
          titlePa: 'ਆਨਲਾਈਨ EDP ਟ੍ਰੇਨਿੰਗ ਪੂਰੀ ਕਰੋ ਅਤੇ 35% ਸਬਸਿਡੀ ਪ੍ਰਾਪਤ ਕਰੋ',
          titleHi: 'ऑनलाइन ईडीपी प्रशिक्षण पूरा करें और 35% सब्सिडी प्राप्त करें',
          descriptionEn: 'Bank sanctions project loan and KVIC deposits 35% subsidy directly into your loan account.',
          descriptionPa: 'ਬੈਂਕ ਕਰਜ਼ਾ ਮਨਜ਼ੂਰ ਕਰਦਾ ਹੈ ਅਤੇ 35% ਸਬਸਿਡੀ ਸਿੱਧੀ ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ।',
          descriptionHi: 'बैंक ऋण स्वीकृत करता है और 35% सब्सिडी सीधे खाते में जमा होती है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Ministry of MSME & KVIC Classic Scheme (Purani Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-kvic-pmegp',
      title: 'KVIC PMEGP 35% Subsidy Loan Portal',
      url: 'https://www.kviconline.gov.in/pmegpeportal',
      description: 'Official Khadi & Village Industries Commission portal for PMEGP 25%–35% subsidy business loans up to ₹50 Lakh.',
      category: 'Loans & Self-Employment',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'purani',
    launchYear: 'Classic Scheme (Purani)',
    scheme: {
      id: 'ai-purani-mai-bhago-vidya-cycles',
      titleEn: 'Mai Bhago Vidya Scheme (Free Bicycles & Study Grant for Govt School Girls)',
      titlePa: 'ਮਾਈ ਭਾਗੋ ਵਿੱਦਿਆ ਸਕੀਮ (ਸਰਕਾਰੀ ਸਕੂਲਾਂ ਦੀਆਂ ਵਿਦਿਆਰਥਣਾਂ ਲਈ ਮੁਫ਼ਤ ਸਾਈਕਲ ਅਤੇ ਸਿੱਖਿਆ ਸਹਾਇਤਾ)',
      titleHi: 'माई भागो विद्या योजना (सरकारी स्कूल की छात्राओं के लिए मुफ्त साइकिल एवं शिक्षा सहायता)',
      level: 'Punjab State',
      departmentEn: 'Department of Social Security & School Education, Punjab',
      departmentPa: 'ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ ਅਤੇ ਸਕੂਲ ਸਿੱਖਿਆ ਵਿਭਾਗ, ਪੰਜਾਬ',
      departmentHi: 'सामाजिक सुरक्षा एवं स्कूल शिक्षा विभाग, पंजाब',
      categoryTags: ['Students', 'Women', 'Education', 'Purani / Classic Scheme', 'AI Admin Added'],
      descriptionEn: 'Classic flagship Punjab scheme providing free bicycles and school mobility support to all girl students enrolled in Class 9, 10, 11, and 12 in Government Schools across Punjab to prevent school dropouts.',
      descriptionPa: 'ਪੰਜਾਬ ਦੀ ਪ੍ਰਸਿੱਧ ਪੁਰਾਣੀ ਸਕੀਮ ਜਿਸ ਤਹਿਤ ਸਰਕਾਰੀ ਸਕੂਲਾਂ ਵਿੱਚ 9ਵੀਂ ਤੋਂ 12ਵੀਂ ਜਮਾਤ ਵਿੱਚ ਪੜ੍ਹਦੀਆਂ ਸਾਰੀਆਂ ਵਿਦਿਆਰਥਣਾਂ ਨੂੰ ਮੁਫ਼ਤ ਸਾਈਕਲ ਅਤੇ ਵਜ਼ੀਫ਼ਾ ਸਹੂਲਤ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।',
      descriptionHi: 'पंजाब की प्रतिष्ठित योजना जिसके तहत सरकारी स्कूलों में कक्षा 9 से 12 में पढ़ने वाली सभी छात्राओं को मुफ्त साइकिल प्रदान की जाती है।',
      benefitAmountText: 'Free Bicycle + Free School Uniform/Books Support for Class 9–12 Girls',
      benefitType: 'In-Kind/Ration',
      minAge: 13,
      maxAge: 20,
      targetGenders: ['Female'],
      eligibleOccupations: ['Student'],
      requiresPunjabDomicile: true,
      requiresStudentStatus: true,
      applicationDeadline: 'Automatic Enrollment via Government School Principal on e-Punjab Portal',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://www.epunjabschool.gov.in',
      officialPortalName: 'e-Punjab School Education Portal',
      youtubeVideoId: 'X9tQf-N5i2A',
      youtubeVideoTitle: 'Mai Bhago Vidya Scheme Punjab Free Cycle & Girl Student Benefits Guide',
      requiredDocuments: [
        { nameEn: 'Government School Enrollment ID (e-Punjab ID)', namePa: 'ਸਰਕਾਰੀ ਸਕੂਲ ਦਾਖਲਾ ਆਈ.ਡੀ (e-Punjab)', nameHi: 'सरकारी स्कूल नामांकन आईडी', issuingAuthority: 'Government School Principal', availableOnDigiLocker: false },
        { nameEn: 'Aadhaar Card of Girl Student', namePa: 'ਵਿਦਿਆਰਥਣ ਦਾ ਆਧਾਰ ਕਾਰਡ', nameHi: 'छात्रा का आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'School Headmaster Uploads Student List on e-Punjab Portal',
          titlePa: 'ਸਕੂਲ ਮੁਖੀ ਵੱਲੋਂ ਈ-ਪੰਜਾਬ ਪੋਰਟਲ ਤੇ ਵਿਦਿਆਰਥਣਾਂ ਦੀ ਸੂਚੀ ਦਰਜ ਕੀਤੀ ਜਾਂਦੀ ਹੈ',
          titleHi: 'स्कूल प्रधानाचार्य द्वारा ई-पंजाब पोर्टल पर सूची अपलोड की जाती है',
          descriptionEn: 'All girls enrolled in Class 9 to 12 in Punjab Govt schools are automatically included.',
          descriptionPa: '9ਵੀਂ ਤੋਂ 12ਵੀਂ ਜਮਾਤ ਦੀਆਂ ਸਾਰੀਆਂ ਵਿਦਿਆਰਥਣਾਂ ਦਾ ਨਾਂ ਆਪਣੇ-ਆਪ ਸ਼ਾਮਲ ਹੁੰਦਾ ਹੈ।',
          descriptionHi: 'कक्षा 9 से 12 की सभी छात्राओं का नाम स्वतः शामिल किया जाता है।'
        },
        {
          stepNumber: 2,
          titleEn: 'Distribution at School Campus',
          titlePa: 'ਸਕੂਲ ਕੈਂਪਸ ਵਿੱਚ ਵੰਡ',
          titleHi: 'स्कूल परिसर में वितरण',
          descriptionEn: 'Bicycles / DBT vouchers distributed through District Education Officer (DEO).',
          descriptionPa: 'ਜ਼ਿਲ੍ਹਾ ਸਿੱਖਿਆ ਅਫ਼ਸਰ (DEO) ਰਾਹੀਂ ਸਕੂਲ ਵਿੱਚ ਸਾਈਕਲ/ਸਹਾਇਤਾ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।',
          descriptionHi: 'जिला शिक्षा अधिकारी के माध्यम से स्कूल में वितरण किया जाता है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Dept of School Education & WCD Punjab (Purani Classic Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-maibhago-epunjab',
      title: 'Mai Bhago Vidya & e-Punjab School Welfare Portal',
      url: 'https://www.epunjabschool.gov.in',
      description: 'Official Punjab School Education portal for Mai Bhago Vidya girls cycle scheme, uniforms, and merit scholarships.',
      category: 'Students & Education',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'purani',
    launchYear: 'Classic Scheme (Purani)',
    scheme: {
      id: 'ai-purani-atal-pension-yojana',
      titleEn: 'Atal Pension Yojana (APY ₹1,000 to ₹5,000/Month Guaranteed Pension)',
      titlePa: 'ਅਟਲ ਪੈਨਸ਼ਨ ਯੋਜਨਾ (APY - ₹1,000 ਤੋਂ ₹5,000 ਪ੍ਰਤੀ ਮਹੀਨਾ ਗਾਰੰਟੀਸ਼ੁਦਾ ਪੈਨਸ਼ਨ)',
      titleHi: 'अटल पेंशन योजना (APY - ₹1,000 से ₹5,000 प्रतिमाह गारंटीकृत पेंशन)',
      level: 'Central Government',
      departmentEn: 'Pension Fund Regulatory and Development Authority (PFRDA), Ministry of Finance',
      departmentPa: 'ਪੈਨਸ਼ਨ ਫੰਡ ਰੈਗੂਲੇਟਰੀ ਅਥਾਰਟੀ (PFRDA), ਵਿੱਤ ਮੰਤਰਾਲਾ',
      departmentHi: 'पेंशन निधि विनियामक और विकास प्राधिकरण (PFRDA), वित्त मंत्रालय',
      categoryTags: ['Monthly Pension', 'Social Security', 'Workers', 'Purani / Classic Scheme', 'AI Admin Added'],
      descriptionEn: 'Classic Government of India guaranteed pension scheme for citizens aged 18–40 providing a fixed monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 per month after age 60 (plus spouse pension and ₹8.5 Lakh corpus return to nominee).',
      descriptionPa: '18 ਤੋਂ 40 ਸਾਲ ਦੇ ਨਾਗਰਿਕਾਂ ਲਈ ਪ੍ਰਸਿੱਧ ਪੁਰਾਣੀ ਸਰਕਾਰੀ ਪੈਨਸ਼ਨ ਯੋਜਨਾ ਜਿਸ ਤਹਿਤ 60 ਸਾਲ ਤੋਂ ਬਾਅਦ ₹1,000 ਤੋਂ ₹5,000 ਪ੍ਰਤੀ ਮਹੀਨਾ ਪੱਕੀ ਪੈਨਸ਼ਨ ਅਤੇ ਪਰਿਵਾਰ ਨੂੰ ₹8.5 ਲੱਖ ਤੱਕ ਦਾ ਫੰਡ ਮਿਲਦਾ ਹੈ।',
      descriptionHi: '18 से 40 वर्ष के नागरिकों के लिए 60 वर्ष की आयु के बाद ₹1,000 से ₹5,000 प्रतिमाह गारंटीकृत पेंशन और ₹8.5 लाख कॉर्पस सुरक्षा।',
      benefitAmountText: '₹1,000 to ₹5,000 / month Guaranteed Pension (₹60,000 / year) + ₹8.5L Nominee Corpus',
      benefitType: 'Pension',
      minAge: 18,
      maxAge: 40,
      requiresPunjabDomicile: false,
      maxIncome: 500000,
      applicationDeadline: 'Open Across All Banks, Post Offices & NetBanking Year-Round',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://enps.nsdl.com',
      officialPortalName: 'eNPS / Atal Pension Official Portal',
      youtubeVideoId: 'oY9lZfR-ClU',
      youtubeVideoTitle: 'Atal Pension Yojana ₹5,000 Monthly Pension Chart, Benefits & Online Apply Guide',
      requiredDocuments: [
        { nameEn: 'Savings Bank Account or Post Office Account', namePa: 'ਬੈਂਕ ਜਾਂ ਡਾਕਘਰ ਬਚਤ ਖਾਤਾ', nameHi: 'बैंक या डाकघर बचत खाता', issuingAuthority: 'Bank / India Post', availableOnDigiLocker: true },
        { nameEn: 'Aadhaar Card linked with Mobile Number', namePa: 'ਮੋਬਾਈਲ ਨਾਲ ਲਿੰਕ ਆਧਾਰ ਕਾਰਡ', nameHi: 'मोबाइल से जुड़ा आधार कार्ड', issuingAuthority: 'UIDAI', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Activate APY via Bank Branch, Post Office, or enps.nsdl.com',
          titlePa: 'ਆਪਣੇ ਬੈਂਕ, ਡਾਕਘਰ ਜਾਂ enps.nsdl.com ਰਾਹੀਂ APY ਖਾਤਾ ਖੋਲ੍ਹੋ',
          titleHi: 'अपनी बैंक शाखा, डाकघर या enps.nsdl.com पर APY खाता खोलें',
          descriptionEn: 'Select pension slab (₹1,000 to ₹5,000/month) and auto-debit frequency.',
          descriptionPa: '₹1,000 ਤੋਂ ₹5,000 ਮਹੀਨਾਵਾਰ ਪੈਨਸ਼ਨ ਸਲੈਬ ਚੁਣੋ।',
          descriptionHi: '₹1,000 से ₹5,000 मासिक पेंशन स्लैब चुनें।'
        },
        {
          stepNumber: 2,
          titleEn: 'Receive PRAN Card & Lifetime Sovereign Pension Guarantee',
          titlePa: 'PRAN ਕਾਰਡ ਅਤੇ ਉਮਰ ਭਰ ਦੀ ਸਰਕਾਰੀ ਪੈਨਸ਼ਨ ਗਾਰੰਟੀ ਪਾਓ',
          titleHi: 'PRAN कार्ड और आजीवन सरकारी पेंशन गारंटी प्राप्त करें',
          descriptionEn: 'Guaranteed lifetime pension for subscriber and spouse after age 60.',
          descriptionPa: '60 ਸਾਲ ਤੋਂ ਬਾਅਦ ਪਤੀ ਅਤੇ ਪਤਨੀ ਦੋਵਾਂ ਨੂੰ ₹5,000/ਮਹੀਨਾ ਤੱਕ ਪੈਨਸ਼ਨ ਮਿਲਦੀ ਹੈ।',
          descriptionHi: '60 वर्ष की आयु के बाद ग्राहक और जीवनसाथी दोनों को आजीवन पेंशन।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · PFRDA Ministry of Finance Notification (Purani Classic Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-apy-enps',
      title: 'Atal Pension Yojana (APY & eNPS National Portal)',
      url: 'https://enps.nsdl.com',
      description: 'Official PFRDA portal for Atal Pension Yojana (₹1,000–₹5,000/month pension) enrollment and PRAN statement download.',
      category: 'Pensions & Social Security',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'purani',
    launchYear: 'Classic Scheme (Purani)',
    scheme: {
      id: 'ai-purani-pm-matru-vandana-yojana',
      titleEn: 'Pradhan Mantri Matru Vandana Yojana (PMMVY ₹5,000–₹11,000 Maternity Grant)',
      titlePa: 'ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਮਾਤਰੂ ਵੰਦਨਾ ਯੋਜਨਾ (ਗਰਭਵਤੀ ਮਹਿਲਾਵਾਂ ਅਤੇ ਮਾਵਾਂ ਲਈ ₹5,000–₹11,000 ਸਹਾਇਤਾ)',
      titleHi: 'प्रधानमंत्री मातृ वंदना योजना (गर्भवती महिलाओं एवं माताओं के लिए ₹5,000–₹11,000 सहायता)',
      level: 'Central Government',
      departmentEn: 'Ministry of Women & Child Development & SSWCD Punjab',
      departmentPa: 'ਮਹਿਲਾ ਅਤੇ ਬਾਲ ਵਿਕਾਸ ਮੰਤਰਾਲਾ ਅਤੇ ਪੰਜਾਬ ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ ਵਿਭਾਗ',
      departmentHi: 'महिला एवं बाल विकास मंत्रालय एवं पंजाब सामाजिक सुरक्षा विभाग',
      categoryTags: ['Women', 'Health', 'Direct Benefit Transfer', 'Purani / Classic Scheme', 'AI Admin Added'],
      descriptionEn: 'Direct cash maternity benefit of ₹5,000 for the first living child and an additional ₹6,000 if the second child is a girl (up to ₹11,000 total) for pregnant and lactating women to support nutrition and wage loss compensation.',
      descriptionPa: 'ਗਰਭਵਤੀ ਅਤੇ ਦੁੱਧ ਪਿਲਾਉਣ ਵਾਲੀਆਂ ਮਾਵਾਂ ਦੀ ਸਿਹਤ ਅਤੇ ਖੁਰਾਕ ਲਈ ਪਹਿਲੇ ਬੱਚੇ ਤੇ ₹5,000 ਅਤੇ ਦੂਜੇ ਬੱਚੇ (ਲੜਕੀ ਹੋਣ ਤੇ) ₹6,000 (ਕੁੱਲ ₹11,000 ਤੱਕ) ਸਿੱਧੀ ਬੈਂਕ ਸਹਾਇਤਾ।',
      descriptionHi: 'गर्भवती और स्तनपान कराने वाली माताओं को पहले बच्चे पर ₹5,000 और दूसरी संतान बालिका होने पर ₹6,000 (कुल ₹11,000) की सीधी सहायता।',
      benefitAmountText: '₹5,000 (1st Child) + ₹6,000 (2nd Girl Child) = up to ₹11,000 Direct Bank Transfer',
      benefitType: 'Direct Cash Transfer',
      minAge: 18,
      maxAge: 50,
      targetGenders: ['Female'],
      requiresPunjabDomicile: false,
      maxIncome: 800000,
      applicationDeadline: 'Register at Nearest Anganwadi Centre or pmmvy.wcd.gov.in',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://pmmvy.wcd.gov.in',
      officialPortalName: 'PMMVY Official Maternity Portal',
      youtubeVideoId: 'v2avonSHyFU',
      youtubeVideoTitle: 'PM Matru Vandana Yojana ₹5000 + ₹6000 Online Apply & Anganwadi Form Process',
      requiredDocuments: [
        { nameEn: 'MCP Card (Mother and Child Protection Card)', namePa: 'ਮਾਂ ਅਤੇ ਬੱਚਾ ਸੁਰੱਖਿਆ ਕਾਰਡ (MCP Card)', nameHi: 'मातृ एवं शिशु सुरक्षा कार्ड (MCP)', issuingAuthority: 'ANM / Government Hospital / Anganwadi', availableOnDigiLocker: false },
        { nameEn: 'Aadhaar Card & Aadhaar-Seeded Bank Account of Mother', namePa: 'ਮਾਂ ਦਾ ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਬੈਂਕ ਪਾਸਬੁੱਕ', nameHi: 'माता का आधार कार्ड और बैंक पासबुक', issuingAuthority: 'UIDAI / Bank', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Register Pregnancy at Anganwadi or pmmvy.wcd.gov.in',
          titlePa: 'ਆਂਗਣਵਾੜੀ ਕੇਂਦਰ ਜਾਂ pmmvy.wcd.gov.in ਤੇ ਰਜਿਸਟਰ ਕਰੋ',
          titleHi: 'आंगनवाड़ी केंद्र या pmmvy.wcd.gov.in पर पंजीकरण करें',
          descriptionEn: 'Submit MCP card details and Aadhaar number online or through ASHA/Anganwadi worker.',
          descriptionPa: 'ਆਸ਼ਾ ਜਾਂ ਆਂਗਣਵਾੜੀ ਵਰਕਰ ਕੋਲ MCP ਕਾਰਡ ਅਤੇ ਆਧਾਰ ਦਰਜ ਕਰਵਾਓ।',
          descriptionHi: 'आशा या आंगनवाड़ी कार्यकर्ता के पास एमसीपी कार्ड और आधार दर्ज कराएं।'
        },
        {
          stepNumber: 2,
          titleEn: 'Receive DBT Installments After Antenatal Checkup & Child Vaccination',
          titlePa: 'ਜਾਂਚ ਅਤੇ ਟੀਕਾਕਰਨ ਤੋਂ ਬਾਅਦ ਸਿੱਧਾ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਭੁਗਤਾਨ',
          titleHi: 'जांच और टीकाकरण के बाद सीधे बैंक खाते में भुगतान',
          descriptionEn: 'Funds transferred directly to mother’s Aadhaar-linked bank account.',
          descriptionPa: 'ਸਹਾਇਤਾ ਰਾਸ਼ੀ ਸਿੱਧੀ ਮਾਂ ਦੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ।',
          descriptionHi: 'सहायता राशि सीधे माता के बैंक खाते में जमा होती है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Ministry of Women & Child Development (Purani Classic Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-pmmvy-wcd',
      title: 'PM Matru Vandana Yojana (PMMVY) Official Portal',
      url: 'https://pmmvy.wcd.gov.in',
      description: 'Official Ministry of Women & Child Development portal for ₹5,000–₹11,000 maternity benefit registration.',
      category: 'Women & Social Welfare',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'purani',
    launchYear: 'Classic Scheme (Purani)',
    scheme: {
      id: 'ai-purani-punjab-bocw-labour-welfare',
      titleEn: 'Punjab Building & Construction Workers (BOCW) Welfare Board Shagun, Scholarship & Health Scheme',
      titlePa: 'ਪੰਜਾਬ ਬਿਲਡਿੰਗ ਐਂਡ ਕੰਸਟ੍ਰਕਸ਼ਨ ਵਰਕਰਜ਼ (ਲੇਬਰ ਕਾਪੀ) ਵਜ਼ੀਫ਼ਾ, ਸ਼ਗਨ ਅਤੇ ਇਲਾਜ ਸਕੀਮ',
      titleHi: 'पंजाब भवन एवं सन्निर्माण कर्मकार (लेबर कार्ड) छात्रवृत्ति, शगुन एवं सहायता योजना',
      level: 'Punjab State',
      departmentEn: 'Punjab Building and Other Construction Workers Welfare Board, Dept of Labour',
      departmentPa: 'ਪੰਜਾਬ ਬਿਲਡਿੰਗ ਐਂਡ ਅਦਰ ਕੰਸਟ੍ਰਕਸ਼ਨ ਵਰਕਰਜ਼ ਵੈਲਫੇਅਰ ਬੋਰਡ, ਕਿਰਤ ਵਿਭਾਗ ਪੰਜਾਬ',
      departmentHi: 'पंजाब भवन एवं अन्य सन्निर्माण कर्मकार कल्याण बोर्ड, श्रम विभाग',
      categoryTags: ['Labour Welfare', 'Workers', 'Students', 'Scholarship', 'Purani / Classic Scheme', 'AI Admin Added'],
      descriptionEn: 'Comprehensive classic Punjab Labour Card ("Laal Copy") welfare scheme for construction workers, masons, carpenters, plumbers, painters, and MGNREGA workers offering ₹3,000 to ₹70,000/year student scholarships, ₹51,000 Shagun grant, ₹2 Lakh ex-gratia, and LTC/bicycle grants.',
      descriptionPa: 'ਪੰਜਾਬ ਦੇ ਰਾਜ ਮਿਸਤਰੀਆਂ, ਮਜ਼ਦੂਰਾਂ, ਤਰਖਾਣਾਂ, ਪਲੰਬਰਾਂ ਅਤੇ ਪੇਂਟਰਾਂ (ਲੇਬਰ ਕਾਪੀ ਧਾਰਕਾਂ) ਦੇ ਬੱਚਿਆਂ ਲਈ ₹3,000 ਤੋਂ ₹70,000 ਤੱਕ ਵਜ਼ੀਫ਼ਾ, ਧੀ ਦੇ ਵਿਆਹ ਲਈ ₹51,000 ਸ਼ਗਨ ਅਤੇ ₹2 ਲੱਖ ਬੀਮਾ ਸਹਾਇਤਾ।',
      descriptionHi: 'पंजाब के निर्माण श्रमिकों (लेबर कार्ड धारकों) के बच्चों के लिए ₹3,000 से ₹70,000 तक छात्रवृत्ति, ₹51,000 शगुन और ₹2 लाख बीमा सहायता।',
      benefitAmountText: '₹3,000–₹70,000 Student Scholarship + ₹51,000 Shagun + ₹2 Lakh Accidental Cover',
      benefitType: 'Direct Cash Transfer',
      minAge: 18,
      maxAge: 60,
      eligibleOccupations: ['Daily Wage Worker', 'Artisan/Craftsperson', 'Agricultural Labourer'],
      requiresPunjabDomicile: true,
      maxIncome: 300000,
      applicationDeadline: 'Open Year-Round on bocw.punjab.gov.in & Sewa Kendras',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://bocw.punjab.gov.in',
      officialPortalName: 'Punjab BOCW Labour Welfare Portal',
      youtubeVideoId: '3vK7sF4wQ0E',
      youtubeVideoTitle: 'Punjab Labour Card (BOCW Laal Copy) Online Registration, Scholarship & Shagun Benefits',
      requiredDocuments: [
        { nameEn: '90-Days Construction Work Self-Declaration / Employer Certificate', namePa: '90 ਦਿਨ ਉਸਾਰੀ ਕੰਮ ਕਰਨ ਦਾ ਸਰਟੀਫਿਕੇਟ / ਸਵੈ-ਘੋਸ਼ਣਾ', nameHi: '90 दिन निर्माण कार्य प्रमाण पत्र', issuingAuthority: 'Labour Inspector / Sarpanch / Contractor', availableOnDigiLocker: false },
        { nameEn: 'Aadhaar Card & Family Bank Account Passbook', namePa: 'ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਬੈਂਕ ਪਾਸਬੁੱਕ', nameHi: 'आधार कार्ड और बैंक पासबुक', issuingAuthority: 'UIDAI / Bank', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Register for BOCW Labour Card at Sewa Kendra or bocw.punjab.gov.in',
          titlePa: 'ਸੇਵਾ ਕੇਂਦਰ ਜਾਂ bocw.punjab.gov.in ਤੇ ਲੇਬਰ ਕਾਪੀ ਬਣਵਾਓ',
          titleHi: 'सेवा केंद्र या bocw.punjab.gov.in पर लेबर कार्ड बनवाएं',
          descriptionEn: 'Workers aged 18–60 who worked 90+ days in construction/allied trades are eligible.',
          descriptionPa: 'ਸਾਲ ਵਿੱਚ 90 ਦਿਨ ਮਜ਼ਦੂਰੀ/ਉਸਾਰੀ ਕੰਮ ਕਰਨ ਵਾਲੇ ਕਾਮੇ ਰਜਿਸਟਰ ਕਰ ਸਕਦੇ ਹਨ।',
          descriptionHi: 'वर्ष में 90 दिन निर्माण कार्य करने वाले श्रमिक पंजीकरण कर सकते हैं।'
        },
        {
          stepNumber: 2,
          titleEn: 'Claim Scholarships, Shagun, Spectacles & Cycle Grants Online',
          titlePa: 'ਬੱਚਿਆਂ ਦੇ ਵਜ਼ੀਫ਼ੇ, ਸ਼ਗਨ ਅਤੇ ਸਾਈਕਲ ਗ੍ਰਾਂਟ ਲਈ ਆਨਲਾਈਨ ਕਲੇਮ ਕਰੋ',
          titleHi: 'छात्रवृत्ति, शगुन और साइकिल अनुदान के लिए ऑनलाइन दावा करें',
          descriptionEn: 'Direct transfer to worker’s bank account after Assistant Labour Commissioner approval.',
          descriptionPa: 'ਕਿਰਤ ਅਫ਼ਸਰ ਦੀ ਮਨਜ਼ੂਰੀ ਤੋਂ ਬਾਅਦ ਸਿੱਧਾ ਖਾਤੇ ਵਿੱਚ ਪੈਸੇ ਆਉਂਦੇ ਹਨ।',
          descriptionHi: 'श्रम अधिकारी की स्वीकृति के बाद सीधे खाते में राशि जमा होती है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Punjab BOCW Welfare Board Notification (Purani Classic Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-bocw-punjab',
      title: 'Punjab BOCW Construction Workers Welfare Board Portal',
      url: 'https://bocw.punjab.gov.in',
      description: 'Official Punjab Labour Welfare Board portal for BOCW Labour Card registration, scholarships, and Shagun benefits.',
      category: 'Labour & Workers',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'purani',
    launchYear: 'Classic Scheme (Purani)',
    scheme: {
      id: 'ai-purani-national-family-benefit-punjab',
      titleEn: 'National Family Benefit Scheme (NFBS ₹20,000 Breadwinner Support Grant)',
      titlePa: 'ਰਾਸ਼ਟਰੀ ਪਰਿਵਾਰਕ ਲਾਭ ਸਕੀਮ (NFBS - ਕਮਾਊ ਜੀਅ ਦੀ ਮੌਤ ਤੇ ₹20,000 ਤੁਰੰਤ ਸਹਾਇਤਾ)',
      titleHi: 'राष्ट्रीय पारिवारिक लाभ योजना (NFBS - कमाऊ सदस्य की मृत्यु पर ₹20,000 सहायता)',
      level: 'Central Government',
      departmentEn: 'Ministry of Rural Development & Dept of Social Security Punjab',
      departmentPa: 'ਪੇਂਡੂ ਵਿਕਾਸ ਮੰਤਰਾਲਾ ਅਤੇ ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ ਵਿਭਾਗ, ਪੰਜਾਬ',
      departmentHi: 'ग्रामीण विकास मंत्रालय एवं सामाजिक सुरक्षा विभाग, पंजाब',
      categoryTags: ['Women', 'Widow Support', 'Social Security', 'Purani / Classic Scheme', 'AI Admin Added'],
      descriptionEn: 'Classic National Social Assistance Programme (NSAP) scheme providing ₹20,000 lump-sum emergency financial assistance to low-income families upon the death of the primary breadwinner aged 18–59 years.',
      descriptionPa: 'ਗਰੀਬ ਪਰਿਵਾਰ ਦੇ ਮੁੱਖ ਕਮਾਊ ਮੈਂਬਰ (ਉਮਰ 18 ਤੋਂ 59 ਸਾਲ) ਦੀ ਅਚਾਨਕ ਮੌਤ ਹੋਣ ਤੇ ਪਰਿਵਾਰ ਨੂੰ ₹20,000 ਦੀ ਇੱਕਮੁਸ਼ਤ ਸਰਕਾਰੀ ਸਹਾਇਤਾ।',
      descriptionHi: 'गरीब परिवार के मुख्य कमाने वाले सदस्य (आयु 18-59 वर्ष) की मृत्यु होने पर परिवार को ₹20,000 की एकमुश्त वित्तीय सहायता।',
      benefitAmountText: '₹20,000 One-Time Emergency Family Grant via Direct Bank Transfer',
      benefitType: 'Direct Cash Transfer',
      minAge: 18,
      maxAge: 65,
      requiresPunjabDomicile: true,
      maxIncome: 100000,
      applicationDeadline: 'Apply at Sewa Kendra / DSSO Office within 1 Year',
      deadlineType: 'Ongoing',
      officialPortalUrl: 'https://nsap.nic.in',
      officialPortalName: 'NSAP National Social Assistance Portal',
      youtubeVideoId: '8a8X9k0mQ1c',
      youtubeVideoTitle: 'National Family Benefit Scheme ₹20,000 Application Process & Documents Guide',
      requiredDocuments: [
        { nameEn: 'Death Certificate of Primary Breadwinner', namePa: 'ਕਮਾਊ ਜੀਅ ਦਾ ਮੌਤ ਸਰਟੀਫਿਕੇਟ', nameHi: 'मृत्यु प्रमाण पत्र', issuingAuthority: 'Registrar of Births & Deaths', availableOnDigiLocker: true },
        { nameEn: 'BPL / Smart Ration Card / Income Proof', namePa: 'ਸਮਾਰਟ ਰਾਸ਼ਨ ਕਾਰਡ ਜਾਂ ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ', nameHi: 'राशन कार्ड या आय प्रमाण पत्र', issuingAuthority: 'Tehsildar / Food Supply Dept', availableOnDigiLocker: true },
        { nameEn: 'Surviving Head of Household Aadhaar & Bank Passbook', namePa: 'ਪਰਿਵਾਰਕ ਮੁਖੀ ਦਾ ਆਧਾਰ ਅਤੇ ਬੈਂਕ ਖਾਤਾ', nameHi: 'आधार कार्ड और बैंक पासबुक', issuingAuthority: 'UIDAI / Bank', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Submit NFBS Application at Nearest Punjab Sewa Kendra or DSSO',
          titlePa: 'ਨੇੜਲੇ ਸੇਵਾ ਕੇਂਦਰ ਜਾਂ ਜ਼ਿਲ੍ਹਾ ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ ਦਫ਼ਤਰ (DSSO) ਵਿਖੇ ਫਾਰਮ ਦਿਓ',
          titleHi: 'नजदीकी सेवा केंद्र या जिला सामाजिक सुरक्षा कार्यालय में आवेदन करें',
          descriptionEn: 'Attach death certificate, ration card, and bank passbook.',
          descriptionPa: 'ਮੌਤ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਰਾਸ਼ਨ ਕਾਰਡ ਦੀ ਕਾਪੀ ਨਾਲ ਨੱਥੀ ਕਰੋ।',
          descriptionHi: 'मृत्यु प्रमाण पत्र और राशन कार्ड की प्रति संलग्न करें।'
        },
        {
          stepNumber: 2,
          titleEn: 'Direct Bank Transfer of ₹20,000',
          titlePa: '₹20,000 ਸਿੱਧੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ',
          titleHi: '₹20,000 सीधे बैंक खाते में हस्तांतरित',
          descriptionEn: 'Sanctioned by District Social Security Officer and credited via NSAP DBT.',
          descriptionPa: 'ਜ਼ਿਲ੍ਹਾ ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ ਅਫ਼ਸਰ ਦੀ ਮਨਜ਼ੂਰੀ ਨਾਲ ਪੈਸੇ ਖਾਤੇ ਵਿੱਚ ਆਉਂਦੇ ਹਨ।',
          descriptionHi: 'जिला सामाजिक सुरक्षा अधिकारी की स्वीकृति से राशि खाते में आती है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · NSAP Ministry of Rural Development (Purani Classic Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-nsap-nic',
      title: 'National Social Assistance Programme (NSAP Pension & NFBS Portal)',
      url: 'https://nsap.nic.in',
      description: 'Official Government of India NSAP portal for National Family Benefit Scheme, Old Age, Widow, and Disability pensions.',
      category: 'Pensions & Social Security',
      createdAt: new Date().toISOString()
    }
  },
  {
    era: 'purani',
    launchYear: 'Classic Scheme (Purani)',
    scheme: {
      id: 'ai-purani-punjab-pre-matric-sc-bc',
      titleEn: 'Punjab Pre-Matric Scholarship Scheme for SC, BC & Minority School Students (Class 1–10)',
      titlePa: 'ਪੰਜਾਬ ਪ੍ਰੀ-ਮੈਟ੍ਰਿਕ ਵਜ਼ੀਫ਼ਾ ਸਕੀਮ (1ਲੀ ਤੋਂ 10ਵੀਂ ਜਮਾਤ ਦੇ SC/BC ਅਤੇ ਘੱਟ ਗਿਣਤੀ ਵਿਦਿਆਰਥੀਆਂ ਲਈ)',
      titleHi: 'पंजाब प्री-मैट्रिक छात्रवृत्ति योजना (कक्षा 1 से 10 के SC/BC एवं अल्पसंख्यक छात्रों हेतु)',
      level: 'Punjab State',
      departmentEn: 'Department of Social Justice, Empowerment & School Education, Punjab',
      departmentPa: 'ਸਮਾਜਿਕ ਨਿਆਂ ਅਤੇ ਸਕੂਲ ਸਿੱਖਿਆ ਵਿਭਾਗ, ਪੰਜਾਬ',
      departmentHi: 'सामाजिक न्याय एवं स्कूल शिक्षा विभाग, पंजाब',
      categoryTags: ['Students', 'Education', 'Scholarship', 'SC/BC/EWS', 'Purani / Classic Scheme', 'AI Admin Added'],
      descriptionEn: 'Foundational scholarship scheme providing ₹3,500 to ₹8,000 per year directly into bank accounts of school students studying in Class 1 to Class 10 belonging to SC, OBC/BC, and Minority families in Punjab.',
      descriptionPa: 'ਪੰਜਾਬ ਦੇ ਸਕੂਲਾਂ ਵਿੱਚ 1ਲੀ ਤੋਂ 10ਵੀਂ ਜਮਾਤ ਵਿੱਚ ਪੜ੍ਹਦੇ ਅਨੁਸੂਚਿਤ ਜਾਤੀ (SC) ਅਤੇ ਪੱਛੜੀਆਂ ਸ਼੍ਰੇਣੀਆਂ (BC) ਦੇ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ₹3,500 ਤੋਂ ₹8,000 ਸਾਲਾਨਾ ਵਜ਼ੀਫ਼ਾ।',
      descriptionHi: 'पंजाब के स्कूलों में कक्षा 1 से 10 में पढ़ने वाले एससी और पिछड़े वर्ग के छात्रों के लिए ₹3,500 से ₹8,000 वार्षिक छात्रवृत्ति।',
      benefitAmountText: '₹3,500 to ₹8,000 / year Direct School Student Scholarship',
      benefitType: 'Scholarship',
      minAge: 5,
      maxAge: 18,
      eligibleCategories: ['SC', 'OBC/BC', 'EWS'],
      eligibleOccupations: ['Student'],
      requiresPunjabDomicile: true,
      requiresStudentStatus: true,
      maxIncome: 250000,
      applicationDeadline: 'Open Every Academic Year on e-Punjab School & NSP Portal',
      deadlineType: 'Seasonal',
      officialPortalUrl: 'https://scholarships.punjab.gov.in',
      officialPortalName: 'Dr. Ambedkar & e-Punjab Scholarship Portal',
      youtubeVideoId: 'X9tQf-N5i2A',
      youtubeVideoTitle: 'Punjab Pre-Matric Scholarship Class 1 to 10 SC/BC Online Apply Process',
      requiredDocuments: [
        { nameEn: 'Student Aadhaar Card & School Admission Number', namePa: 'ਵਿਦਿਆਰਥੀ ਦਾ ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਸਕੂਲ ਦਾਖਲਾ ਨੰਬਰ', nameHi: 'छात्र का आधार कार्ड और स्कूल प्रवेश संख्या', issuingAuthority: 'UIDAI / School', availableOnDigiLocker: true },
        { nameEn: 'SC / BC Caste Certificate & Income Certificate (< ₹2.5 Lakh)', namePa: 'ਜਾਤੀ ਅਤੇ ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ (< ₹2.5 ਲੱਖ)', nameHi: 'जाति और आय प्रमाण पत्र (< ₹2.5 लाख)', issuingAuthority: 'Tehsildar / Sewa Kendra', availableOnDigiLocker: true }
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          titleEn: 'Apply via School Nodal Teacher on e-Punjab / NSP Portal',
          titlePa: 'ਸਕੂਲ ਅਧਿਆਪਕ ਰਾਹੀਂ ਈ-ਪੰਜਾਬ / ਸਕਾਲਰਸ਼ਿਪ ਪੋਰਟਲ ਤੇ ਫਾਰਮ ਭਰੋ',
          titleHi: 'स्कूल नोडल शिक्षक के माध्यम से ई-पंजाब पोर्टल पर आवेदन करें',
          descriptionEn: 'Provide student Aadhaar, caste certificate, and bank account details.',
          descriptionPa: 'ਵਿਦਿਆਰਥੀ ਦਾ ਆਧਾਰ, ਜਾਤੀ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਬੈਂਕ ਖਾਤਾ ਦਰਜ ਕਰਵਾਓ।',
          descriptionHi: 'छात्र का आधार, जाति प्रमाण पत्र और बैंक खाता दर्ज कराएं।'
        },
        {
          stepNumber: 2,
          titleEn: 'Annual Scholarship Credited via PFMS DBT',
          titlePa: 'ਸਾਲਾਨਾ ਵਜ਼ੀਫ਼ਾ ਸਿੱਧਾ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ (DBT)',
          titleHi: 'वार्षिक छात्रवृत्ति सीधे बैंक खाते में जमा',
          descriptionEn: 'Transferred directly by Punjab Welfare Dept & Ministry of Social Justice.',
          descriptionPa: 'ਵਜ਼ੀਫ਼ਾ ਰਾਸ਼ੀ ਸਿੱਧੀ ਵਿਦਿਆਰਥੀ ਦੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ।',
          descriptionHi: 'छात्रवृत्ति सीधे छात्र के बैंक खाते में जमा होती है।'
        }
      ],
      sourceCitation: 'AI Admin Auto-Synced · Dept of Social Justice & School Education Punjab (Purani Classic Scheme)',
      verifiedDate: 'November 2026'
    },
    portal: {
      id: 'portal-prematric-punjab',
      title: 'Punjab Pre-Matric & Post-Matric Scholarship Portal',
      url: 'https://scholarships.punjab.gov.in',
      description: 'Official Punjab portal for Class 1–10 Pre-Matric and College Post-Matric SC/BC scholarships.',
      category: 'Students & Education',
      createdAt: new Date().toISOString()
    }
  }
];

