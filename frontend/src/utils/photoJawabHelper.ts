import { Language } from '../types/scheme';
import { getIndianLanguageConfig } from './indianLanguages';

export type PhotoJawabCategory =
  | 'ration_card'
  | 'electricity_bill'
  | 'application_form'
  | 'certificate_or_notice';

export interface PhotoJawabExtractedField {
  labelPa: string;
  labelHi: string;
  labelEn: string;
  value: string;
}

export interface PhotoJawabAnalysis {
  category: PhotoJawabCategory;
  badgePa: string;
  badgeHi: string;
  badgeEn: string;
  documentTitlePa: string;
  documentTitleHi: string;
  documentTitleEn: string;
  ehdeChKiLikheyaPa: string;
  ehdeChKiLikheyaHi: string;
  ehdeChKiLikheyaEn: string;
  keyFields: PhotoJawabExtractedField[];
  aggeKiKarnaPa: string[];
  aggeKiKarnaHi: string[];
  aggeKiKarnaEn: string[];
  sewaKendraTipPa: string;
  sewaKendraTipHi: string;
  sewaKendraTipEn: string;
  unlockedSchemeIds: string[];
  confidenceScore: number;
  formattedReply: string;
}

export interface SamplePhotoJawabPreset {
  key: PhotoJawabCategory;
  emoji: string;
  shortLabelPa: string;
  shortLabelHi: string;
  shortLabelEn: string;
  subtitlePa: string;
  subtitleHi: string;
  subtitleEn: string;
  sampleFileName: string;
  sampleRawText: string;
  previewSvgDataUrl: string;
}

function makePreviewSvgDataUrl(
  bgStart: string,
  bgEnd: string,
  headerText: string,
  titleText: string,
  line1: string,
  line2: string,
  stampText: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="300" viewBox="0 0 520 300">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgStart}" />
        <stop offset="100%" stop-color="${bgEnd}" />
      </linearGradient>
    </defs>
    <rect width="520" height="300" rx="18" fill="url(#bg)" />
    <rect x="16" y="16" width="488" height="268" rx="12" fill="#ffffff" fill-opacity="0.95" />
    <rect x="16" y="16" width="488" height="50" rx="12" fill="${bgStart}" />
    <text x="32" y="47" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="bold">${headerText}</text>
    <text x="32" y="98" fill="#0f172a" font-family="sans-serif" font-size="19" font-weight="bold">${titleText}</text>
    <line x1="32" y1="112" x2="480" y2="112" stroke="#cbd5e1" stroke-width="1.5" />
    <text x="32" y="145" fill="#334155" font-family="sans-serif" font-size="14" font-weight="600">${line1}</text>
    <text x="32" y="178" fill="#334155" font-family="sans-serif" font-size="14" font-weight="600">${line2}</text>
    <rect x="32" y="210" width="250" height="44" rx="8" fill="#f1f5f9" stroke="#94a3b8" />
    <text x="44" y="237" fill="#0f172a" font-family="monospace" font-size="13" font-weight="bold">${stampText}</text>
    <circle cx="430" cy="225" r="34" fill="none" stroke="${bgStart}" stroke-width="3" stroke-dasharray="5,3" />
    <text x="430" y="229" text-anchor="middle" fill="${bgStart}" font-family="sans-serif" font-size="11" font-weight="bold">VERIFIED</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PHOTO_JAWAB_PRESETS: SamplePhotoJawabPreset[] = [
  {
    key: 'ration_card',
    emoji: '🪪',
    shortLabelPa: 'ਰਾਸ਼ਨ ਕਾਰਡ ਦੀ ਫ਼ੋਟੋ',
    shortLabelHi: 'राशन कार्ड की फोटो',
    shortLabelEn: 'Ration Card Photo',
    subtitlePa: 'NFSA / ਆਟਾ-ਦਾਲ ਸਮਾਰਟ ਰਾਸ਼ਨ ਕਾਰਡ',
    subtitleHi: 'NFSA / स्मार्ट राशन कार्ड',
    subtitleEn: 'Punjab NFSA / Smart Ration Card',
    sampleFileName: 'Punjab_Smart_Ration_Card_NFSA.jpg',
    sampleRawText:
      'DEPARTMENT OF FOOD CIVIL SUPPLIES PUNJAB SMART RATION CARD NFSA PHH Card No: 03-PB-NFSA-8841209 Head of Family: Gurpreet Kaur Members: 4 e-KYC Status: 1 Member Pending Fair Price Shop Depot #412',
    previewSvgDataUrl: makePreviewSvgDataUrl(
      '#1e3a8a',
      '#0d9488',
      'PUNJAB FOOD & CIVIL SUPPLIES • NFSA SMART CARD',
      'Smart Ration Card (PHH / Atta-Dal)',
      'Card No: 03-PB-NFSA-8841209 • Family Members: 4',
      'Status: Active • Notice: Biometric e-KYC Required',
      'FPS Depot #412 • Ludhiana'
    ),
  },
  {
    key: 'electricity_bill',
    emoji: '💡',
    shortLabelPa: 'ਬਿਜਲੀ ਬਿੱਲ ਦੀ ਫ਼ੋਟੋ',
    shortLabelHi: 'बिजली बिल की फोटो',
    shortLabelEn: 'Electricity Bill Photo',
    subtitlePa: 'PSPCL ਘਰੇਲੂ ਬਿਜਲੀ ਬਿੱਲ (300 ਯੂਨਿਟ ਮਾਫ਼ੀ)',
    subtitleHi: 'PSPCL घरेलू बिजली बिल (300 यूनिट छूट)',
    subtitleEn: 'PSPCL Domestic Power Bill (300 Units Subsidy)',
    sampleFileName: 'PSPCL_Electricity_Bill_Domestic.jpg',
    sampleRawText:
      'PUNJAB STATE POWER CORPORATION LTD PSPCL DOMESTIC BILL Account No: 3004819204 Tariff Category: DS Domestic Supply Consumed Units: 540 Bimonthly (270/month) 300 Units Free Subsidy Applied Net Payable Amount: ₹0 Due Date: 28 Nov 2026',
    previewSvgDataUrl: makePreviewSvgDataUrl(
      '#0f766e',
      '#0369a1',
      'PSPCL • PUNJAB STATE POWER CORPORATION LTD',
      'Domestic Electricity Bill (Category: DS)',
      'A/C No: 3004819204 • Units Used: 540 (2 Months)',
      '600 Bi-Monthly Free Quota Applied • Payable: ₹0',
      'Valid Address & Domicile Proof'
    ),
  },
  {
    key: 'application_form',
    emoji: '📝',
    shortLabelPa: 'ਸਰਕਾਰੀ ਫਾਰਮ ਦੀ ਫ਼ੋਟੋ',
    shortLabelHi: 'सरकारी फॉर्म की फोटो',
    shortLabelEn: 'Application Form Photo',
    subtitlePa: 'ਪੈਨਸ਼ਨ / ਸ਼ਗਨ / ਕਿਸਾਨ ਸੇਵਾ ਕੇਂਦਰ ਫਾਰਮ',
    subtitleHi: 'पेंशन / शगुन / किसान सेवा केंद्र फॉर्म',
    subtitleEn: 'Sewa Kendra Pension / Welfare Application Form',
    sampleFileName: 'Sewa_Kendra_Application_Form.jpg',
    sampleRawText:
      'PUNJAB SEWA KENDRA APPLICATION FORM FOR SOCIAL SECURITY PENSION / ASHIRWAD SHAGUN / PM-KISAN Box 1: Applicant Name as per Aadhaar Box 2: 12-Digit Aadhaar No Box 3: Single Bank Account & IFSC (NPCI DBT Active) Box 4: Tehsildar Income Certificate Barcode Number Signature / Thumb Impression Required',
    previewSvgDataUrl: makePreviewSvgDataUrl(
      '#4338ca',
      '#1e40af',
      'PUNJAB E-SEWA KENDRA • WELFARE APPLICATION FORM',
      'Citizen Financial Assistance Form (DBT)',
      '1. Name (Match Aadhaar)   2. Bank A/C + IFSC (NPCI)',
      '3. e-Sewa Income Barcode  4. Applicant Signature/Thumb',
      'Attach: Aadhaar + Passbook Copy'
    ),
  },
  {
    key: 'certificate_or_notice',
    emoji: '📜',
    shortLabelPa: 'ਸਰਟੀਫਿਕੇਟ / ਨੋਟਿਸ ਫ਼ੋਟੋ',
    shortLabelHi: 'प्रमाण पत्र / नोटिस फोटो',
    shortLabelEn: 'Certificate / Notice Photo',
    subtitlePa: 'ਆਮਦਨ / ਜਾਤੀ ਸਰਟੀਫਿਕੇਟ ਜਾਂ ਬੈਂਕ DBT ਨੋਟਿਸ',
    subtitleHi: 'आय / जाति प्रमाण पत्र या बैंक DBT नोटिस',
    subtitleEn: 'Income / Caste Certificate or Bank DBT Notice',
    sampleFileName: 'Punjab_eSewa_Income_Certificate_Notice.jpg',
    sampleRawText:
      'GOVERNMENT OF PUNJAB E-SEWA CERTIFICATE & BANK DBT NOTICE Certificate ID: ESW-PB-2026-99214 Annual Family Income: Rs 95,000 Notice: Ensure Aadhaar NPCI Seeding is active in Bank Account for uninterrupted DBT release',
    previewSvgDataUrl: makePreviewSvgDataUrl(
      '#b45309',
      '#92400e',
      'GOVT OF PUNJAB • E-SEWA & DBT VERIFICATION NOTICE',
      'Income Certificate & Bank NPCI Advisory',
      'Ref: ESW-PB-2026-99214 • Verified Income: ₹95,000/yr',
      'Action: Link Aadhaar NPCI with Bank for Direct Benefit',
      'Helpline: 1100 • Sewa Kendra'
    ),
  },
];

export function detectPhotoJawabCategory(input: {
  fileName?: string;
  rawText?: string;
  presetKey?: string;
}): PhotoJawabCategory {
  if (
    input.presetKey === 'ration_card' ||
    input.presetKey === 'electricity_bill' ||
    input.presetKey === 'application_form' ||
    input.presetKey === 'certificate_or_notice'
  ) {
    return input.presetKey;
  }

  const combined = `${input.fileName || ''} ${input.rawText || ''}`.toLowerCase();

  if (
    combined.includes('ration') ||
    combined.includes('nfsa') ||
    combined.includes('atta') ||
    combined.includes('dal') ||
    combined.includes('phh') ||
    combined.includes('depot') ||
    combined.includes('ਰਾਸ਼ਨ') ||
    combined.includes('राशन')
  ) {
    return 'ration_card';
  }

  if (
    combined.includes('bill') ||
    combined.includes('pspcl') ||
    combined.includes('electricity') ||
    combined.includes('bijli') ||
    combined.includes('meter') ||
    combined.includes('unit') ||
    combined.includes('ਬਿਜਲੀ') ||
    combined.includes('बिजली') ||
    combined.includes('ਬਿੱਲ') ||
    combined.includes('बिल')
  ) {
    return 'electricity_bill';
  }

  if (
    combined.includes('form') ||
    combined.includes('application') ||
    combined.includes('box 1') ||
    combined.includes('signature') ||
    combined.includes('thumb') ||
    combined.includes('ਫਾਰਮ') ||
    combined.includes('फॉर्म') ||
    combined.includes('ਅਰਜ਼ੀ')
  ) {
    return 'application_form';
  }

  return 'certificate_or_notice';
}

export function formatPhotoJawabChatReply(
  analysis: Omit<PhotoJawabAnalysis, 'formattedReply'>,
  languageOrLocale: string = 'pa'
): string {
  const langCfg = getIndianLanguageConfig(languageOrLocale);
  const usePunjabi = langCfg.prefix === 'pa';
  const useDevanagari = langCfg.scriptFamily === 'devanagari';

  const docTitle = usePunjabi
    ? analysis.documentTitlePa
    : useDevanagari
      ? analysis.documentTitleHi
      : analysis.documentTitleEn;

  const headingWhatIsWritten = usePunjabi
    ? '📋 **ਇਹਦੇ ਵਿੱਚ ਕੀ ਲਿਖਿਆ ਹੈ (Ehde ch ki likheya aa):**'
    : useDevanagari
      ? '📋 **इसमें क्या लिखा है (Ehde ch ki likheya aa):**'
      : '📋 **What is written in this photo (Ehde ch ki likheya aa):**';

  const bodyWhatIsWritten = usePunjabi
    ? analysis.ehdeChKiLikheyaPa
    : useDevanagari
      ? analysis.ehdeChKiLikheyaHi
      : analysis.ehdeChKiLikheyaEn;

  const extractedLines = analysis.keyFields
    .map((f) => {
      const label = usePunjabi ? f.labelPa : useDevanagari ? f.labelHi : f.labelEn;
      return `• **${label}:** ${f.value}`;
    })
    .join('\n');

  const headingNextSteps = usePunjabi
    ? '👉 **ਅੱਗੇ ਕੀ ਕਰਨਾ ਹੈ (Agge ki karna aa):**'
    : useDevanagari
      ? '👉 **आगे क्या करना है (Agge ki karna aa):**'
      : '👉 **What to do next (Agge ki karna aa):**';

  const stepsList = (usePunjabi
    ? analysis.aggeKiKarnaPa
    : useDevanagari
      ? analysis.aggeKiKarnaHi
      : analysis.aggeKiKarnaEn
  )
    .map((step, idx) => `${idx + 1}. ${step}`)
    .join('\n');

  const sewaTipLabel = usePunjabi
    ? '🏛️ **ਸੇਵਾ ਕੇਂਦਰ / ਸਰਕਾਰੀ ਸਲਾਹ:**'
    : useDevanagari
      ? '🏛️ **सेवा केंद्र / सरकारी सलाह:**'
      : '🏛️ **Sewa Kendra / Official Tip:**';

  const sewaTipText = usePunjabi
    ? analysis.sewaKendraTipPa
    : useDevanagari
      ? analysis.sewaKendraTipHi
      : analysis.sewaKendraTipEn;

  return (
    `📸 **Photo Bhejo, Jawab Pao — ${docTitle}**\n\n` +
    `${headingWhatIsWritten}\n${bodyWhatIsWritten}\n\n` +
    `${extractedLines}\n\n` +
    `${headingNextSteps}\n${stepsList}\n\n` +
    `${sewaTipLabel} ${sewaTipText}`
  );
}

export function analyzePhotoJawabInput(input: {
  fileName?: string;
  rawText?: string;
  presetKey?: string;
  language?: Language | string;
  aiSummaryText?: string;
}): PhotoJawabAnalysis {
  const category = detectPhotoJawabCategory(input);
  const lang = input.language || 'pa';

  let base: Omit<PhotoJawabAnalysis, 'formattedReply'>;

  if (category === 'ration_card') {
    base = {
      category: 'ration_card',
      badgePa: 'ਰਾਸ਼ਨ ਕਾਰਡ ਪਛਾਣਿਆ ਗਿਆ',
      badgeHi: 'राशन कार्ड पहचाना गया',
      badgeEn: 'Ration Card Detected',
      documentTitlePa: 'ਪੰਜਾਬ ਸਮਾਰਟ ਰਾਸ਼ਨ ਕਾਰਡ (NFSA / ਆਟਾ-ਦਾਲ ਕਾਰਡ)',
      documentTitleHi: 'पंजाब स्मार्ट राशन कार्ड (NFSA / आटा-दाल कार्ड)',
      documentTitleEn: 'Punjab Smart Ration Card (NFSA / Atta-Dal Card)',
      ehdeChKiLikheyaPa:
        'ਇਹ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਦਾ ਅਧਿਕਾਰਤ NFSA ਸਮਾਰਟ ਰਾਸ਼ਨ ਕਾਰਡ ਹੈ। ਇਸ ਵਿੱਚ ਪਰਿਵਾਰ ਦੇ ਮੁਖੀ ਦਾ ਨਾਮ, ਕੁੱਲ 4 ਪਰਿਵਾਰਕ ਮੈਂਬਰ, ਅਤੇ ਤੁਹਾਡੇ ਰਾਸ਼ਨ ਡਿਪੂ (FPS #412) ਦਾ ਨੰਬਰ ਦਰਜ ਹੈ। ਕਾਰਡ ਉੱਤੇ ਲਿਖਿਆ ਹੈ ਕਿ ਸਾਰੇ ਮੈਂਬਰਾਂ ਦੀ ਆਧਾਰ ਬਾਇਓਮੈਟ੍ਰਿਕ e-KYC ਹੋਣੀ ਲਾਜ਼ਮੀ ਹੈ।',
      ehdeChKiLikheyaHi:
        'यह आपके परिवार का आधिकारिक NFSA स्मार्ट राशन कार्ड है। इसमें परिवार के मुखिया का नाम, कुल 4 सदस्य और राशन डिपो (FPS #412) का विवरण लिखा है। कार्ड में बताया गया है कि सभी सदस्यों का आधार e-KYC होना अनिवार्य है।',
      ehdeChKiLikheyaEn:
        'This is your official Punjab NFSA Smart Ration Card (Priority Household). It lists the Head of Family, 4 registered family members, and Fair Price Shop Depot #412. It also notes that biometric Aadhaar e-KYC must be completed for all members.',
      keyFields: [
        {
          labelPa: 'ਦਸਤਾਵੇਜ਼ ਦੀ ਕਿਸਮ',
          labelHi: 'दस्तावेज़ का प्रकार',
          labelEn: 'Document Type',
          value: 'NFSA Smart Ration Card (PHH)',
        },
        {
          labelPa: 'ਰਾਸ਼ਨ ਕਾਰਡ ਨੰਬਰ',
          labelHi: 'राशन कार्ड नंबर',
          labelEn: 'Ration Card Number',
          value: '03-PB-NFSA-8841209',
        },
        {
          labelPa: 'ਪਰਿਵਾਰਕ ਮੈਂਬਰ ਅਤੇ ਸਥਿਤੀ',
          labelHi: 'परिवार के सदस्य व स्थिति',
          labelEn: 'Family Members & Status',
          value: '4 Members Active (e-KYC Check Advised)',
        },
        {
          labelPa: 'ਮਿਲਣ ਵਾਲੇ ਮੁੱਖ ਲਾਭ',
          labelHi: 'मिलने वाले मुख्य लाभ',
          labelEn: 'Linked Entitlements',
          value: 'Free Monthly Wheat/Atta + ₹5 Lakh Ayushman Health Card',
        },
      ],
      aggeKiKarnaPa: [
        'ਆਪਣੇ ਨੇੜਲੇ ਰਾਸ਼ਨ ਡਿਪੂ (Fair Price Shop) ਜਾਂ ਸੇਵਾ ਕੇਂਦਰ ਤੇ ਜਾ ਕੇ ਸਾਰੇ ਪਰਿਵਾਰਕ ਮੈਂਬਰਾਂ ਦਾ ਆਧਾਰ ਅੰਗੂਠਾ (e-KYC) ਲਗਵਾਓ ਤਾਂ ਜੋ ਰਾਸ਼ਨ ਬੰਦ ਨਾ ਹੋਵੇ।',
        'ਇਸੇ ਰਾਸ਼ਨ ਕਾਰਡ ਨੰਬਰ ਨਾਲ ਤੁਹਾਨੂੰ "ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਸਰਬਤ ਸਿਹਤ ਬੀਮਾ ਯੋਜਨਾ" ਤਹਿਤ ₹5 ਲੱਖ ਤੱਕ ਦਾ ਮੁਫ਼ਤ ਇਲਾਜ ਕਾਰਡ ਮਿਲਦਾ ਹੈ — ਸੇਵਾ ਕੇਂਦਰ ਤੋਂ ਆਪਣਾ ਸਿਹਤ ਕਾਰਡ ਪ੍ਰਿੰਟ ਕਰਵਾਓ।',
        'ਜੇਕਰ ਕਿਸੇ ਨਵੇਂ ਬੱਚੇ ਜਾਂ ਨੂੰਹ ਦਾ ਨਾਮ ਜੋੜਨਾ ਹੈ, ਤਾਂ ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਜਨਮ/ਵਿਆਹ ਸਰਟੀਫਿਕੇਟ ਲੈ ਕੇ ਸੇਵਾ ਕੇਂਦਰ ਵਿੱਚ "Add Member in Ration Card" ਫਾਰਮ ਭਰੋ।',
      ],
      aggeKiKarnaHi: [
        'अपने नजदीकी राशन डिपो या सेवा केंद्र पर जाकर सभी सदस्यों का आधार बायोमेट्रिक (e-KYC) पूरा करवाएं ताकि मुफ्त राशन चालू रहे।',
        'इसी राशन कार्ड नंबर से "आयुष्मान भारत सरबत सेहत बीमा योजना" का ₹5 लाख का मुफ्त इलाज कार्ड बनता है — इसे सेवा केंद्र से डाउनलोड करवाएं।',
        'यदि परिवार में किसी नए सदस्य का नाम जोड़ना है, तो आधार कार्ड के साथ सेवा केंद्र में आवेदन करें।',
      ],
      aggeKiKarnaEn: [
        'Visit your nearest Fair Price Shop (Ration Depot) or Sewa Kendra with family members to complete biometric Aadhaar e-KYC so monthly ration stays active.',
        'Use this Smart Ration Card number to instantly generate your ₹5 Lakh Ayushman Bharat Sarbat Sehat Bima health card at any Sewa Kendra or CSC.',
        'To add a newborn or spouse to this card, carry their Aadhaar Card and Birth/Marriage certificate to your district Sewa Kendra.',
      ],
      sewaKendraTipPa:
        'ਰਾਸ਼ਨ ਕਾਰਡ ਨਾਲ ਜੁੜੀ ਕਿਸੇ ਵੀ ਸ਼ਿਕਾਇਤ ਲਈ ਟੋਲ-ਫ੍ਰੀ ਹੈਲਪਲਾਈਨ 1967 ਜਾਂ 1100 ਉੱਤੇ ਕਾਲ ਕਰੋ। ਕਿਸੇ ਵੀ ਏਜੰਟ ਨੂੰ ਪੈਸੇ ਨਾ ਦਿਓ।',
      sewaKendraTipHi:
        'राशन कार्ड से जुड़ी किसी भी शिकायत के लिए टोल-फ्री हेल्पलाइन 1967 या 1100 पर कॉल करें।',
      sewaKendraTipEn:
        'For any Ration Depot grievance, call toll-free helpline 1967 or 1100. e-KYC at the Ration Depot is 100% free.',
      unlockedSchemeIds: ['smart-ration-card', 'sarbat-sehat-bima', 'ujjwala-yojana'],
      confidenceScore: 98,
    };
  } else if (category === 'electricity_bill') {
    base = {
      category: 'electricity_bill',
      badgePa: 'ਬਿਜਲੀ ਦਾ ਬਿੱਲ ਪਛਾਣਿਆ ਗਿਆ',
      badgeHi: 'बिजली का बिल पहचाना गया',
      badgeEn: 'Electricity Bill Detected',
      documentTitlePa: 'ਪੰਜਾਬ ਸਟੇਟ ਪਾਵਰ ਕਾਰਪੋਰੇਸ਼ਨ (PSPCL) ਘਰੇਲੂ ਬਿਜਲੀ ਬਿੱਲ',
      documentTitleHi: 'पंजाब स्टेट पावर कॉर्पोरेशन (PSPCL) घरेलू बिजली बिल',
      documentTitleEn: 'PSPCL Domestic Electricity Bill (Punjab)',
      ehdeChKiLikheyaPa:
        'ਇਹ ਤੁਹਾਡੇ ਘਰ ਦਾ PSPCL ਘਰੇਲੂ ਬਿਜਲੀ ਬਿੱਲ (DS ਸ਼੍ਰੇਣੀ) ਹੈ। ਇਸ ਵਿੱਚ ਤੁਹਾਡਾ ਖਾਤਾ ਨੰਬਰ 3004819204 ਅਤੇ 2 ਮਹੀਨਿਆਂ ਦੀ ਖਪਤ 540 ਯੂਨਿਟ (ਮਹੀਨੇ ਦੇ 270 ਯੂਨਿਟ) ਲਿਖੀ ਹੈ। ਪੰਜਾਬ ਸਰਕਾਰ ਦੀ 300 ਯੂਨਿਟ ਪ੍ਰਤੀ ਮਹੀਨਾ (600 ਯੂਨਿਟ ਦੋ ਮਹੀਨੇ) ਮੁਫ਼ਤ ਬਿਜਲੀ ਸਕੀਮ ਲਾਗੂ ਹੋਣ ਕਰਕੇ ਤੁਹਾਡਾ ਭਰਨ ਯੋਗ ਬਿੱਲ ₹0 (ਜ਼ੀਰੋ) ਹੈ।',
      ehdeChKiLikheyaHi:
        'यह आपके घर का PSPCL घरेलू बिजली बिल (DS श्रेणी) है। इसमें खाता संख्या 3004819204 और 2 महीने की खपत 540 यूनिट लिखी है। पंजाब सरकार की 300 यूनिट प्रति माह मुफ्त बिजली योजना के तहत आपका देय बिल ₹0 (शून्य) है।',
      ehdeChKiLikheyaEn:
        'This is your PSPCL Domestic Supply (DS) electricity bill. It shows Account No. 3004819204 with 540 bi-monthly units consumed (270 units/month). Because consumption is within the 600 bi-monthly unit limit under the Punjab 300 Units Free Electricity Scheme, your net payable amount is ₹0.',
      keyFields: [
        {
          labelPa: 'ਬਿੱਲ ਦੀ ਕਿਸਮ',
          labelHi: 'बिल का प्रकार',
          labelEn: 'Bill Type',
          value: 'PSPCL Domestic Supply (DS)',
        },
        {
          labelPa: 'ਖਪਤਕਾਰ ਖਾਤਾ ਨੰਬਰ',
          labelHi: 'उपभोक्ता खाता संख्या',
          labelEn: 'Consumer Account No',
          value: '3004819204',
        },
        {
          labelPa: 'ਖਪਤ ਅਤੇ ਭਰਨ ਯੋਗ ਰਕਮ',
          labelHi: 'खपत और देय राशि',
          labelEn: 'Units & Net Payable',
          value: '540 Units (2 Months) • Payable: ₹0 (Subsidy Applied)',
        },
        {
          labelPa: 'ਸਰਕਾਰੀ ਦਸਤਾਵੇਜ਼ ਵਜੋਂ ਵਰਤੋਂ',
          labelHi: 'सरकारी दस्तावेज़ के रूप में उपयोग',
          labelEn: 'Official Document Use',
          value: 'Valid Punjab Address & Residence Proof at Sewa Kendra',
        },
      ],
      aggeKiKarnaPa: [
        'ਤੁਹਾਡਾ ਬਿੱਲ ₹0 (ਜ਼ੀਰੋ) ਹੈ, ਇਸ ਲਈ ਤੁਹਾਨੂੰ ਕੋਈ ਪੈਸਾ ਜਮ੍ਹਾਂ ਕਰਵਾਉਣ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ। ਇਸ ਬਿੱਲ ਨੂੰ ਸੰਭਾਲ ਕੇ ਰੱਖੋ।',
        'ਇਹ ਬਿਜਲੀ ਬਿੱਲ ਸੇਵਾ ਕੇਂਦਰ ਵਿੱਚ "ਪੰਜਾਬ ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ (Residence/Domicile Certificate)", "ਆਸ਼ੀਰਵਾਦ ਸ਼ਗਨ ਸਕੀਮ", ਅਤੇ "ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ" ਲਈ ਪੱਕੇ ਪਤੇ ਦੇ ਸਬੂਤ (Address Proof) ਵਜੋਂ ਚੱਲਦਾ ਹੈ।',
        'ਜੇਕਰ ਤੁਹਾਡਾ ਮੋਬਾਈਲ ਨੰਬਰ PSPCL ਖਾਤੇ ਨਾਲ ਲਿੰਕ ਨਹੀਂ ਹੈ, ਤਾਂ 1912 ਹੈਲਪਲਾਈਨ ਜਾਂ PSPCL ਐਪ ਤੇ ਆਧਾਰ/ਮੋਬਾਈਲ ਰਜਿਸਟਰ ਕਰੋ ਤਾਂ ਜੋ ਸਬਸਿਡੀ ਲਗਾਤਾਰ ਮਿਲਦੀ ਰਹੇ।',
      ],
      aggeKiKarnaHi: [
        'आपका देय बिल ₹0 (शून्य) है, इसलिए कोई भुगतान करने की आवश्यकता नहीं है।',
        'इस बिजली बिल को सेवा केंद्र में "पंजाब निवास प्रमाण पत्र (Residence Certificate)", "आशीर्वाद शगुन योजना" और "पेंशन योजनाओं" के लिए पते के प्रमाण (Address Proof) के रूप में उपयोग करें।',
        'यदि बिजली बिल में कोई त्रुटि हो तो PSPCL टोल-फ्री नंबर 1912 पर संपर्क करें।',
      ],
      aggeKiKarnaEn: [
        'Your net payable bill is ₹0 under the 300 Units/Month Free Electricity subsidy, so no payment is needed.',
        'Keep this bill safely — it serves as an official Address & Residence Proof at Punjab Sewa Kendras for Domicile Certificates, Ashirwad Shagun Scheme, and Social Security Pensions.',
        'Link your mobile number with your PSPCL Consumer ID via helpline 1912 to receive SMS bill alerts.',
      ],
      sewaKendraTipPa:
        'ਬਿਜਲੀ ਬਿੱਲ ਦੇ ਨਾਮ ਤੇ ਆਉਣ ਵਾਲੇ ਕਿਸੇ ਵੀ ਫ਼ਰਜ਼ੀ WhatsApp ਲਿੰਕ ਜਾਂ "ਅੱਜ ਰਾਤ ਬਿਜਲੀ ਕੱਟੀ ਜਾਵੇਗੀ" ਵਾਲੇ ਧੋਖੇਬਾਜ਼ ਮੈਸੇਜ ਤੇ ਕਲਿੱਕ ਨਾ ਕਰੋ। ਸਿਰਫ਼ 1912 ਤੇ ਪੁਸ਼ਟੀ ਕਰੋ।',
      sewaKendraTipHi:
        '"आज रात बिजली कट जाएगी" जैसे फर्जी WhatsApp संदेशों या लिंक पर कभी क्लिक न करें। केवल 1912 पर पुष्टि करें।',
      sewaKendraTipEn:
        'Never click suspicious WhatsApp messages claiming power disconnection tonight. Verify only via official PSPCL helpline 1912.',
      unlockedSchemeIds: ['punjab-300-units-free-electricity', 'ashirwad-scheme', 'punjab-old-age-pension'],
      confidenceScore: 97,
    };
  } else if (category === 'application_form') {
    base = {
      category: 'application_form',
      badgePa: 'ਸਰਕਾਰੀ ਅਰਜ਼ੀ ਫਾਰਮ ਪਛਾਣਿਆ ਗਿਆ',
      badgeHi: 'सरकारी आवेदन फॉर्म पहचाना गया',
      badgeEn: 'Government Application Form Detected',
      documentTitlePa: 'ਪੰਜਾਬ ਸੇਵਾ ਕੇਂਦਰ ਭਲਾਈ ਸਕੀਮ ਅਰਜ਼ੀ ਫਾਰਮ (DBT ਫਾਰਮ)',
      documentTitleHi: 'पंजाब सेवा केंद्र कल्याण योजना आवेदन फॉर्म (DBT फॉर्म)',
      documentTitleEn: 'Punjab Sewa Kendra Welfare Application Form (DBT)',
      ehdeChKiLikheyaPa:
        'ਇਹ ਪੰਜਾਬ ਸਰਕਾਰ ਦੀ ਭਲਾਈ ਸਕੀਮ (ਪੈਨਸ਼ਨ / ਆਸ਼ੀਰਵਾਦ ਸ਼ਗਨ / ਕਿਸਾਨ ਸਹਾਇਤਾ) ਦਾ ਅਰਜ਼ੀ ਫਾਰਮ ਹੈ। ਇਸ ਫਾਰਮ ਦੇ 4 ਮੁੱਖ ਹਿੱਸੇ ਹਨ: (1) ਬਿਨੈਕਾਰ ਦਾ ਨਾਮ ਅਤੇ ਆਧਾਰ ਨੰਬਰ, (2) ਸਿੰਗਲ ਬੈਂਕ ਖਾਤਾ ਨੰਬਰ ਅਤੇ IFSC ਕੋਡ, (3) ਤਹਿਸੀਲਦਾਰ ਵੱਲੋਂ ਜਾਰੀ ਆਮਦਨ/ਜਾਤੀ ਸਰਟੀਫਿਕੇਟ ਨੰਬਰ, ਅਤੇ (4) ਹੇਠਾਂ ਬਿਨੈਕਾਰ ਦੇ ਦਸਤਖ਼ਤ ਜਾਂ ਅੰਗੂਠੇ ਦਾ ਨਿਸ਼ਾਨ।',
      ehdeChKiLikheyaHi:
        'यह पंजाब सरकार की कल्याणकारी योजना (पेंशन / आशीर्वाद शगुन / किसान सहायता) का आवेदन फॉर्म है। इसमें 4 मुख्य भाग हैं: (1) आधार के अनुसार नाम व नंबर, (2) बैंक खाता संख्या और IFSC कोड, (3) आय/जाति प्रमाण पत्र बारकोड नंबर, और (4) आवेदक के हस्ताक्षर या अंगूठे का निशान।',
      ehdeChKiLikheyaEn:
        'This is an official Punjab Sewa Kendra welfare scheme application form. It requires 4 key sections: (1) Applicant Name matching Aadhaar verbatim, (2) Single-holder Bank Account Number & IFSC Code with NPCI DBT seeding, (3) e-Sewa Income/Caste Certificate barcode number, and (4) Applicant signature or thumb impression.',
      keyFields: [
        {
          labelPa: 'ਡੱਬਾ 1-2 (ਨਾਮ ਅਤੇ ਆਧਾਰ)',
          labelHi: 'बॉक्स 1-2 (नाम और आधार)',
          labelEn: 'Box 1-2 (Name & Aadhaar)',
          value: 'Write exact spelling printed on Aadhaar Card',
        },
        {
          labelPa: 'ਡੱਬਾ 3 (ਬੈਂਕ ਖਾਤਾ ਤੇ IFSC)',
          labelHi: 'बॉक्स 3 (बैंक खाता व IFSC)',
          labelEn: 'Box 3 (Bank A/C & IFSC)',
          value: 'Must be Aadhaar-NPCI Linked Single Account',
        },
        {
          labelPa: 'ਡੱਬਾ 4 (ਸਰਟੀਫਿਕੇਟ ਬਾਰਕੋਡ)',
          labelHi: 'बॉक्स 4 (प्रमाण पत्र बारकोड)',
          labelEn: 'Box 4 (e-Sewa Barcode)',
          value: 'Enter ESW/PB Barcode from Income/Caste Certificate',
        },
        {
          labelPa: 'ਨਾਲ ਲਗਾਉਣ ਵਾਲੇ ਕਾਗਜ਼',
          labelHi: 'साथ लगाने वाले दस्तावेज़',
          labelEn: 'Required Attachments',
          value: 'Aadhaar Copy + Bank Passbook Front Page + 1 Photo',
        },
      ],
      aggeKiKarnaPa: [
        'ਫਾਰਮ ਦੇ ਪਹਿਲੇ ਡੱਬੇ ਵਿੱਚ ਆਪਣਾ ਨਾਮ ਬਿਲਕੁਲ ਆਧਾਰ ਕਾਰਡ ਵਾਲੀ ਸਪੈਲਿੰਗ ਅਨੁਸਾਰ ਸਾਫ਼-ਸਾਫ਼ ਲਿਖੋ (ਕੱਟ-ਵੱਢ ਨਾ ਕਰੋ)।',
        'ਬੈਂਕ ਖਾਤੇ ਵਾਲੇ ਕਾਲਮ ਵਿੱਚ ਆਪਣੀ ਪਾਸਬੁੱਕ ਦੇ ਪਹਿਲੇ ਪੰਨੇ ਤੋਂ ਦੇਖ ਕੇ ਖਾਤਾ ਨੰਬਰ ਅਤੇ 11-ਅੱਖਰਾਂ ਦਾ IFSC ਕੋਡ ਭਰੋ।',
        'ਫ਼ੋਟੋ ਵਾਲੀ ਥਾਂ ਤੇ ਆਪਣੀ ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫ਼ੋਟੋ ਲਗਾਓ ਅਤੇ ਹੇਠਾਂ ਦਸਤਖ਼ਤ ਜਾਂ ਅੰਗੂਠਾ ਲਗਾਓ।',
        'ਇਸ ਭਰੇ ਹੋਏ ਫਾਰਮ ਦੇ ਨਾਲ ਆਧਾਰ ਕਾਰਡ, ਬੈਂਕ ਪਾਸਬੁੱਕ ਅਤੇ ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ ਦੀ ਫ਼ੋਟੋਕਾਪੀ ਲਗਾ ਕੇ ਆਪਣੇ ਨੇੜਲੇ ਸੇਵਾ ਕੇਂਦਰ ਵਿੱਚ ਜਮ੍ਹਾਂ ਕਰਵਾਓ ਅਤੇ ਕੰਪਿਊਟਰ ਵਾਲੀ ਰਸੀਦ (Acknowledgement Slip) ਜ਼ਰੂਰ ਲਓ।',
      ],
      aggeKiKarnaHi: [
        'फॉर्म के पहले बॉक्स में अपना नाम बिल्कुल आधार कार्ड की स्पेलिंग के अनुसार साफ अक्षरों में भरें।',
        'बैंक पासबुक के पहले पन्ने से देखकर खाता संख्या और 11-अक्षरों का IFSC कोड भरें।',
        'फोटो चिपकाकर नीचे हस्ताक्षर या अंगूठे का निशान लगाएं।',
        'आधार कार्ड, बैंक पासबुक और आय प्रमाण पत्र की फोटोकॉपी साथ लगाकर नजदीकी सेवा केंद्र में जमा करें और रसीद (Receipt) अवश्य लें।',
      ],
      aggeKiKarnaEn: [
        'Fill Box 1 with your exact name spelling as printed on your Aadhaar Card without overwriting.',
        'Copy your Bank Account Number and 11-character IFSC code carefully from the front page of your bank passbook.',
        'Affix one passport-size photograph and sign or put your thumb impression in the bottom declaration box.',
        'Submit the form along with photocopies of Aadhaar, Bank Passbook, and e-Sewa Certificate at your nearest Punjab Sewa Kendra and collect your printed Acknowledgement Receipt.',
      ],
      sewaKendraTipPa:
        'ਸੇਵਾ ਕੇਂਦਰ ਵਿੱਚ ਫਾਰਮ ਜਮ੍ਹਾਂ ਕਰਵਾਉਣ ਵੇਲੇ ਸਿਰਫ਼ ਸਰਕਾਰੀ ਫ਼ੀਸ (₹30–₹50) ਦਿਓ ਅਤੇ ਪੱਕੀ ਰਸੀਦ ਲਓ। ਰਸੀਦ ਨੰਬਰ ਨਾਲ ਤੁਸੀਂ ਇਸ ਐਪ ਦੇ "Application Tracker" ਵਿੱਚ ਸਥਿਤੀ ਚੈੱਕ ਕਰ ਸਕਦੇ ਹੋ।',
      sewaKendraTipHi:
        'सेवा केंद्र में फॉर्म जमा करते समय पक्की रसीद अवश्य लें ताकि आप अपने आवेदन की स्थिति ट्रैक कर सकें।',
      sewaKendraTipEn:
        'Always collect the official Sewa Kendra receipt with the ESW tracking number so you can track approval status.',
      unlockedSchemeIds: ['punjab-old-age-pension', 'pm-kisan', 'post-matric-sc'],
      confidenceScore: 96,
    };
  } else {
    base = {
      category: 'certificate_or_notice',
      badgePa: 'ਸਰਕਾਰੀ ਸਰਟੀਫਿਕੇਟ / ਨੋਟਿਸ ਪਛਾਣਿਆ ਗਿਆ',
      badgeHi: 'सरकारी प्रमाण पत्र / नोटिस पहचाना गया',
      badgeEn: 'Official Certificate / Notice Detected',
      documentTitlePa: 'ਪੰਜਾਬ ਈ-ਸੇਵਾ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਬੈਂਕ DBT ਸੂਚਨਾ',
      documentTitleHi: 'पंजाब ई-सेवा प्रमाण पत्र और बैंक DBT सूचना',
      documentTitleEn: 'Punjab e-Sewa Certificate & Bank DBT Notice',
      ehdeChKiLikheyaPa:
        'ਇਹ ਪੰਜਾਬ ਸਰਕਾਰ ਦੇ ਈ-ਸੇਵਾ ਪੋਰਟਲ ਵੱਲੋਂ ਜਾਰੀ ਕੀਤਾ ਗਿਆ ਅਧਿਕਾਰਤ ਸਰਟੀਫਿਕੇਟ/ਨੋਟਿਸ (Ref: ESW-PB-2026-99214) ਹੈ। ਇਸ ਵਿੱਚ ਤੁਹਾਡੀ ਸਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ ₹95,000 ਤਸਦੀਕ ਕੀਤੀ ਗਈ ਹੈ ਅਤੇ ਦੱਸਿਆ ਗਿਆ ਹੈ ਕਿ ਸਰਕਾਰੀ ਪੈਸੇ (DBT) ਸਿੱਧੇ ਖਾਤੇ ਵਿੱਚ ਪਾਉਣ ਲਈ ਤੁਹਾਡਾ ਬੈਂਕ ਖਾਤਾ ਆਧਾਰ NPCI ਨਾਲ ਲਿੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।',
      ehdeChKiLikheyaHi:
        'यह पंजाब ई-सेवा पोर्टल द्वारा जारी प्रमाण पत्र/नोटिस (Ref: ESW-PB-2026-99214) है। इसमें आपकी वार्षिक पारिवारिक आय ₹95,000 सत्यापित है और बताया गया है कि सरकारी राशि (DBT) प्राप्त करने के लिए बैंक खाता आधार NPCI से लिंक होना आवश्यक है।',
      ehdeChKiLikheyaEn:
        'This is an official Punjab e-Sewa verification document (Ref: ESW-PB-2026-99214) confirming an annual family income of ₹95,000 and advising that your bank account must have active Aadhaar NPCI seeding for direct benefit transfer (DBT).',
      keyFields: [
        {
          labelPa: 'ਸਰਟੀਫਿਕੇਟ / ਨੋਟਿਸ ਨੰਬਰ',
          labelHi: 'प्रमाण पत्र / नोटिस नंबर',
          labelEn: 'Reference ID',
          value: 'ESW-PB-2026-99214',
        },
        {
          labelPa: 'ਤਸਦੀਕ ਕੀਤੀ ਆਮਦਨ',
          labelHi: 'सत्यापित वार्षिक आय',
          labelEn: 'Verified Annual Income',
          value: '₹95,000 / Year (Valid for Welfare Schemes)',
        },
        {
          labelPa: 'ਮੁੱਖ ਹਦਾਇਤ',
          labelHi: 'मुख्य निर्देश',
          labelEn: 'Key Instruction',
          value: 'Ensure Aadhaar-NPCI Bank Seeding is Active',
        },
      ],
      aggeKiKarnaPa: [
        'ਕਿਉਂਕਿ ਤੁਹਾਡੀ ਤਸਦੀਕ ਆਮਦਨ ₹95,000 ਹੈ, ਤੁਸੀਂ ਪੋਸਟ-ਮੈਟ੍ਰਿਕ ਵਜ਼ੀਫ਼ਾ, ਆਸ਼ੀਰਵਾਦ ਸ਼ਗਨ ਸਕੀਮ (₹51,000), ਅਤੇ ਪੈਨਸ਼ਨ ਸਕੀਮਾਂ ਲਈ ਪੂਰੀ ਤਰ੍ਹਾਂ ਯੋਗ ਹੋ।',
        'ਆਪਣੀ ਬੈਂਕ ਸ਼ਾਖਾ ਵਿੱਚ ਜਾ ਕੇ "Aadhaar NPCI DBT Seeding Form" ਭਰੋ ਤਾਂ ਜੋ ਸਕੀਮ ਦੇ ਪੈਸੇ ਬਿਨਾਂ ਰੁਕਾਵਟ ਸਿੱਧੇ ਖਾਤੇ ਵਿੱਚ ਆਉਣ।',
        'ਇਸ ਸਰਟੀਫਿਕੇਟ ਦਾ ESW ਨੰਬਰ ਆਨਲਾਈਨ ਫਾਰਮ ਭਰਨ ਵੇਲੇ ਵਰਤੋ।',
      ],
      aggeKiKarnaHi: [
        '₹95,000 वार्षिक आय के साथ आप छात्रवृत्ति, आशीर्वाद शगुन योजना (₹51,000) और पेंशन योजनाओं के लिए पात्र हैं।',
        'अपनी बैंक शाखा में जाकर आधार NPCI सीडिंग सक्रिय करवाएं ताकि DBT का पैसा सीधे खाते में आए।',
        'ऑनलाइन आवेदन करते समय इस प्रमाण पत्र का ESW बारकोड नंबर दर्ज करें।',
      ],
      aggeKiKarnaEn: [
        'With a verified annual income of ₹95,000, you qualify for Post-Matric Scholarships, Ashirwad Shagun Scheme (₹51,000), and Social Security Pensions.',
        'Confirm with your bank branch that Aadhaar NPCI DBT mapping is enabled on your primary savings account.',
        'Use the ESW reference barcode on this certificate when submitting your application at Sewa Kendra or esewa.punjab.gov.in.',
      ],
      sewaKendraTipPa:
        'ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ 1 ਸਾਲ ਲਈ ਵੈਧ ਹੁੰਦਾ ਹੈ। ਕਿਸੇ ਵੀ ਮਦਦ ਲਈ ਪੰਜਾਬ ਸਰਕਾਰ ਦੀ ਹੈਲਪਲਾਈਨ 1100 ਤੇ ਸੰਪਰਕ ਕਰੋ।',
      sewaKendraTipHi:
        'आय प्रमाण पत्र 1 वर्ष के लिए मान्य होता है। किसी भी सहायता के लिए हेल्पलाइन 1100 पर कॉल करें।',
      sewaKendraTipEn:
        'Income certificates are valid for 1 year from issue date. Call helpline 1100 for official e-Sewa assistance.',
      unlockedSchemeIds: ['post-matric-sc', 'ashirwad-scheme', 'punjab-old-age-pension'],
      confidenceScore: 95,
    };
  }

  // If Gemini multimodal vision returned custom text summary, append or enrich the explanation
  if (input.aiSummaryText && input.aiSummaryText.trim().length > 20) {
    const cleanAi = input.aiSummaryText.trim();
    base = {
      ...base,
      ehdeChKiLikheyaPa: `${base.ehdeChKiLikheyaPa}\n\n🔍 AI ਫ਼ੋਟੋ ਰੀਡਰ ਵੇਰਵਾ: ${cleanAi}`,
      ehdeChKiLikheyaHi: `${base.ehdeChKiLikheyaHi}\n\n🔍 AI फोटो रीडर विवरण: ${cleanAi}`,
      ehdeChKiLikheyaEn: `${base.ehdeChKiLikheyaEn}\n\n🔍 AI Photo Reader Note: ${cleanAi}`,
    };
  }

  return {
    ...base,
    formattedReply: formatPhotoJawabChatReply(base, String(lang)),
  };
}
