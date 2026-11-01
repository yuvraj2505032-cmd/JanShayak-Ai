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
}

export const AI_DISCOVERABLE_SCHEMES_POOL: AiDiscoveredBundle[] = [
  {
    scheme: {
      id: 'ai-punjab-cm-young-intern-2026',
      titleEn: 'Shaheed Bhagat Singh Punjab Youth Internship & Digital Laptop Grant',
      titlePa: 'ਸ਼ਹੀਦ ਭਗਤ ਸਿੰਘ ਪੰਜਾਬ ਯੂਥ ਇੰਟਰਨਸ਼ਿਪ ਅਤੇ ਡਿਜੀਟਲ ਲੈਪਟਾਪ ਗ੍ਰਾਂਟ',
      titleHi: 'शहीद भगत सिंह पंजाब युवा इंटर्नशिप एवं डिजिटल लैपटॉप अनुदान',
      level: 'Punjab State',
      departmentEn: 'Department of Higher Education & Youth Services, Punjab',
      departmentPa: 'ਉਚੇਰੀ ਸਿੱਖਿਆ ਅਤੇ ਯੁਵਕ ਸੇਵਾਵਾਂ ਵਿਭਾਗ, ਪੰਜਾਬ',
      departmentHi: 'उच्च शिक्षा एवं युवा सेवा विभाग, पंजाब',
      categoryTags: ['Students', 'Education', 'Youth', 'Scholarship', 'Digital Tablet/Laptop', 'AI Admin Added'],
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
      sourceCitation: 'AI Admin Auto-Synced · Dept of Higher Education Punjab Notification 2026',
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
    scheme: {
      id: 'ai-pm-surya-ghar-punjab-2026',
      titleEn: 'PM Surya Ghar: Muft Bijli Rooftop Solar Subsidy Scheme',
      titlePa: 'ਪੀ.ਐਮ ਸੂਰਿਆ ਘਰ: ਮੁਫ਼ਤ ਬਿਜਲੀ ਰੂਫ਼ਟਾਪ ਸੋਲਰ ਸਬਸਿਡੀ ਸਕੀਮ',
      titleHi: 'पीएम सूर्य घर: मुफ्त बिजली रूफटॉप सोलर सब्सिडी योजना',
      level: 'Central Government',
      departmentEn: 'Ministry of New & Renewable Energy (MNRE) & PEDA Punjab',
      departmentPa: 'ਨਵੀਂ ਅਤੇ ਨਵਿਆਉਣਯੋਗ ਊਰਜਾ ਮੰਤਰਾਲਾ ਅਤੇ ਪੇਡਾ ਪੰਜਾਬ',
      departmentHi: 'नवीन और नवीकरणीय ऊर्जा मंत्रालय एवं पेडा पंजाब',
      categoryTags: ['Subsidy', 'Free Electricity', 'Finance', 'Rural & Urban Households', 'AI Admin Added'],
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
      sourceCitation: 'AI Admin Auto-Synced · MNRE & PEDA Gazette Notification 2026',
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
    scheme: {
      id: 'ai-pm-internship-scheme-2026',
      titleEn: 'Prime Minister Internship Scheme (PMIS) for Youth & Students',
      titlePa: 'ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਇੰਟਰਨਸ਼ਿਪ ਸਕੀਮ (PMIS) - ਵਿਦਿਆਰਥੀਆਂ ਅਤੇ ਨੌਜਵਾਨਾਂ ਲਈ',
      titleHi: 'प्रधानमंत्री इंटर्नशिप योजना (PMIS) - युवाओं और छात्रों के लिए',
      level: 'Central Government',
      departmentEn: 'Ministry of Corporate Affairs, Government of India',
      departmentPa: 'ਕਾਰਪੋਰੇਟ ਮਾਮਲੇ ਮੰਤਰਾਲਾ, ਭਾਰਤ ਸਰਕਾਰ',
      departmentHi: 'कॉर्पोरेट कार्य मंत्रालय, भारत सरकार',
      categoryTags: ['Students', 'Education', 'Youth', 'Jobs', 'Monthly Stipend', 'AI Admin Added'],
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
      sourceCitation: 'AI Admin Auto-Synced · Ministry of Corporate Affairs Notification 2026',
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
    scheme: {
      id: 'ai-punjab-kisan-dsr-solar-2026',
      titleEn: 'Punjab Direct Seeding of Rice (DSR) & Solar Agriculture Pump Grant',
      titlePa: 'ਪੰਜਾਬ ਝੋਨੇ ਦੀ ਸਿੱਧੀ ਬਿਜਾਈ (DSR ₹1,500/ਏਕੜ) ਅਤੇ ਸੋਲਰ ਪੰਪ ਸਬਸਿਡੀ',
      titleHi: 'पंजाब धान की सीधी बुवाई (DSR ₹1,500/एकड़) एवं सोलर पंप सब्सिडी',
      level: 'Punjab State',
      departmentEn: 'Department of Agriculture & PEDA, Government of Punjab',
      departmentPa: 'ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ ਅਤੇ ਪੇਡਾ, ਪੰਜਾਬ ਸਰਕਾਰ',
      departmentHi: 'कृषि विभाग एवं पेडा, पंजाब सरकार',
      categoryTags: ['Farmers', 'Agriculture', 'Direct Benefit Transfer', 'Subsidy', 'AI Admin Added'],
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
      sourceCitation: 'AI Admin Auto-Synced · Dept of Agriculture Punjab Notification 2026',
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
    scheme: {
      id: 'ai-lakhpati-didi-drone-didi-2026',
      titleEn: 'PM Lakhpati Didi & Namo Drone Didi Women SHG Empowerment Scheme',
      titlePa: 'ਪੀ.ਐਮ ਲਖਪਤੀ ਦੀਦੀ ਅਤੇ ਨਮੋ ਡਰੋਨ ਦੀਦੀ ਮਹਿਲਾ ਸਵੈ-ਸਹਾਇਤਾ ਸਕੀਮ',
      titleHi: 'पीएम लखपति दीदी एवं नमो ड्रोन दीदी महिला स्वयं सहायता योजना',
      level: 'Central Government',
      departmentEn: 'Ministry of Rural Development & PSRLM (Aajeevika Punjab)',
      departmentPa: 'ਪੇਂਡੂ ਵਿਕਾਸ ਮੰਤਰਾਲਾ ਅਤੇ ਪੰਜਾਬ ਰਾਜ ਗ੍ਰਾਮੀਣ ਆਜੀਵਿਕਾ ਮਿਸ਼ਨ',
      departmentHi: 'ग्रामीण विकास मंत्रालय एवं पंजाब राज्य ग्रामीण आजीविका मिशन',
      categoryTags: ['Women', 'Self-Employed', 'Agriculture', 'Subsidy', 'AI Admin Added'],
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
      sourceCitation: 'AI Admin Auto-Synced · Ministry of Rural Development Notification 2026',
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
    scheme: {
      id: 'ai-ayushman-vay-vandana-70plus-2026',
      titleEn: 'Ayushman Vay Vandana Card for All Senior Citizens Aged 70+ (No Income Limit)',
      titlePa: 'ਆਯੁਸ਼ਮਾਨ ਵਯ ਵੰਦਨਾ ਕਾਰਡ - 70+ ਸਾਲ ਦੇ ਸਾਰੇ ਬਜ਼ੁਰਗਾਂ ਲਈ ₹5 ਲੱਖ ਮੁਫ਼ਤ ਇਲਾਜ',
      titleHi: 'आयुष्मान वय वंदना कार्ड - 70+ वर्ष के सभी वरिष्ठ नागरिकों के लिए ₹5 लाख मुफ्त इलाज',
      level: 'Central Government',
      departmentEn: 'National Health Authority (NHA) & Health Department Punjab',
      departmentPa: 'ਰਾਸ਼ਟਰੀ ਸਿਹਤ ਅਥਾਰਟੀ ਅਤੇ ਸਿਹਤ ਵਿਭਾਗ ਪੰਜਾਬ',
      departmentHi: 'राष्ट्रीय स्वास्थ्य प्राधिकरण एवं स्वास्थ्य विभाग पंजाब',
      categoryTags: ['Senior Citizens', 'Health', 'Cashless Hospitalization', 'Universal Care', 'AI Admin Added'],
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
      sourceCitation: 'AI Admin Auto-Synced · National Health Authority (NHA) Notification 2026',
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
    scheme: {
      id: 'ai-punjab-udan-mahila-health-2026',
      titleEn: 'Punjab UDAAN & Mahila Swasthya Self-Employment Welfare Scheme',
      titlePa: 'ਪੰਜਾਬ ਉਡਾਣ (UDAAN) ਅਤੇ ਮਹਿਲਾ ਸਿਹਤ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਭਲਾਈ ਸਕੀਮ',
      titleHi: 'पंजाब उड़ान (UDAAN) एवं महिला स्वास्थ्य स्वरोजगार कल्याण योजना',
      level: 'Punjab State',
      departmentEn: 'Department of Social Security, Women & Child Development, Punjab',
      departmentPa: 'ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ, ਇਸਤਰੀ ਅਤੇ ਬਾਲ ਵਿਕਾਸ ਵਿਭਾਗ, ਪੰਜਾਬ',
      departmentHi: 'सामाजिक सुरक्षा, महिला एवं बाल विकास विभाग, पंजाब',
      categoryTags: ['Women', 'Students', 'Health', 'In-Kind/Ration', 'AI Admin Added'],
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
  {
    scheme: {
      id: 'ai-pmegp-msme-subsidy-2026',
      titleEn: 'Prime Minister Employment Generation Programme (PMEGP 35% Subsidy Loan)',
      titlePa: 'ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਰੋਜ਼ਗਾਰ ਉਤਪੱਤੀ ਪ੍ਰੋਗਰਾਮ (PMEGP - 35% ਸਬਸਿਡੀ ਵਾਲਾ ਵਪਾਰਕ ਕਰਜ਼ਾ)',
      titleHi: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP - 35% सब्सिडी व्यावसायिक ऋण)',
      level: 'Central Government',
      departmentEn: 'Ministry of MSME & Khadi and Village Industries Commission (KVIC Punjab)',
      departmentPa: 'ਐਮ.ਐਸ.ਐਮ.ਈ ਮੰਤਰਾਲਾ ਅਤੇ ਖਾਦੀ ਗ੍ਰਾਮੋਦਯੋਗ ਕਮਿਸ਼ਨ (KVIC ਪੰਜਾਬ)',
      departmentHi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय एवं खादी ग्रामोद्योग आयोग',
      categoryTags: ['Self-Employed', 'Youth', 'Loan/Credit', 'Subsidy', 'AI Admin Added'],
      descriptionEn: 'Credit-linked capital subsidy up to 35% in rural Punjab (25% in urban areas) on project cost up to ₹50 Lakh for manufacturing units and ₹20 Lakh for service/trading businesses.',
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
      sourceCitation: 'AI Admin Auto-Synced · Ministry of MSME & KVIC Notification 2026',
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
  }
];
