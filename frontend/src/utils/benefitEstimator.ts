import { CitizenProfile, Scheme } from '../types/scheme';

export interface BenefitEstimatorInputs {
  familySize: number;
  eligibleMembersInFamily: number;
  cropAcreage: number;
  durationYears: number;
  annualTuitionFee: number;
  monthlyElectricityUnits: number;
  workDaysPerYear: number;
  loanOrProjectAmount: number;
}

export interface BenefitBreakdownItem {
  id: string;
  labelEn: string;
  labelPa: string;
  labelHi: string;
  annualAmount: number;
  totalAmount: number;
  formulaText: string;
}

export interface BenefitEstimateResult {
  schemeId: string;
  annualBenefit: number;
  totalProjectedBenefit: number;
  monthlyEquivalent: number;
  relevantFields: Array<keyof BenefitEstimatorInputs>;
  breakdown: BenefitBreakdownItem[];
  summaryNoteEn: string;
  summaryNotePa: string;
  summaryNoteHi: string;
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

export function getDefaultEstimatorInputs(
  scheme: Scheme,
  profile?: CitizenProfile
): BenefitEstimatorInputs {
  const isStudentScheme =
    scheme.benefitType === 'Scholarship' ||
    Boolean(scheme.requiresStudentStatus) ||
    scheme.eligibleOccupations?.includes('Student');

  const isFarmerScheme =
    scheme.eligibleOccupations?.includes('Farmer') ||
    scheme.categoryTags.some((t) => /farmer|agri|crop/i.test(t));

  return {
    familySize: 4,
    eligibleMembersInFamily: isStudentScheme ? 1 : 1,
    cropAcreage: clamp(profile?.landholdingAcres || (isFarmerScheme ? 4 : 2), 0.5, 25),
    durationYears: isStudentScheme ? 3 : 1,
    annualTuitionFee: isStudentScheme ? 45000 : 30000,
    monthlyElectricityUnits: 280,
    workDaysPerYear: 100,
    loanOrProjectAmount:
      scheme.benefitType === 'Loan/Credit' || scheme.benefitType === 'Subsidy'
        ? 200000
        : 100000,
  };
}

export function calculateSchemeBenefit(
  scheme: Scheme,
  rawInputs: Partial<BenefitEstimatorInputs>
): BenefitEstimateResult {
  const defaults = getDefaultEstimatorInputs(scheme);
  const familySize = clamp(Math.round(rawInputs.familySize ?? defaults.familySize), 1, 12);
  const eligibleMembers = clamp(
    Math.round(rawInputs.eligibleMembersInFamily ?? defaults.eligibleMembersInFamily),
    1,
    familySize
  );
  const cropAcreage = clamp(Number(rawInputs.cropAcreage ?? defaults.cropAcreage), 0.5, 25);
  const durationYears = clamp(Math.round(rawInputs.durationYears ?? defaults.durationYears), 1, 5);
  const annualTuitionFee = clamp(
    Math.round(rawInputs.annualTuitionFee ?? defaults.annualTuitionFee),
    0,
    500000
  );
  const monthlyElectricityUnits = clamp(
    Math.round(rawInputs.monthlyElectricityUnits ?? defaults.monthlyElectricityUnits),
    50,
    1000
  );
  const workDaysPerYear = clamp(
    Math.round(rawInputs.workDaysPerYear ?? defaults.workDaysPerYear),
    5,
    100
  );
  const loanOrProjectAmount = clamp(
    Math.round(rawInputs.loanOrProjectAmount ?? defaults.loanOrProjectAmount),
    10000,
    2500000
  );

  const id = scheme.id;
  const breakdown: BenefitBreakdownItem[] = [];
  let relevantFields: Array<keyof BenefitEstimatorInputs> = ['familySize', 'durationYears'];

  // 1. PM-KISAN
  if (id === 'pm-kisan') {
    relevantFields = ['familySize', 'cropAcreage', 'durationYears'];
    const baseDbT = 6000;
    // Crop input & KCC linkage savings per acre (~₹1,200/acre soil/seed/interest benefit)
    const acreageSupport = Math.round(cropAcreage * 1200);
    breakdown.push({
      id: 'pmkisan-dbt',
      labelEn: 'PM-Kisan Direct Bank Transfer (3 Installments)',
      labelPa: 'ਪੀ.ਐਮ-ਕਿਸਾਨ ਸਿੱਧਾ ਬੈਂਕ ਭੁਗਤਾਨ (3 ਕਿਸ਼ਤਾਂ)',
      labelHi: 'पीएम-किसान प्रत्यक्ष बैंक हस्तांतरण (3 किस्तें)',
      annualAmount: baseDbT,
      totalAmount: baseDbT * durationYears,
      formulaText: `₹2,000 × 3 installments × ${durationYears} yr(s)`,
    });
    breakdown.push({
      id: 'pmkisan-acreage',
      labelEn: `Seed, Soil Card & Fertilizer Input Savings (${cropAcreage} Acres)`,
      labelPa: `ਬੀਜ ਅਤੇ ਖਾਦ ਸਬਸਿਡੀ ਬੱਚਤ (${cropAcreage} ਏਕੜ)`,
      labelHi: `बीज एवं उर्वरक इनपुट बचत (${cropAcreage} एकड़)`,
      annualAmount: acreageSupport,
      totalAmount: acreageSupport * durationYears,
      formulaText: `${cropAcreage} acres × ₹1,200/acre × ${durationYears} yr(s)`,
    });
  }
  // 2. Punjab Direct Seeding of Rice (DSR) & Solar Pump
  else if (id === 'ai-punjab-kisan-dsr-solar-2026') {
    relevantFields = ['cropAcreage', 'loanOrProjectAmount', 'durationYears'];
    const dsrGrant = Math.round(cropAcreage * 1500);
    const solarPumpSubsidy = Math.round(Math.min(loanOrProjectAmount, 250000) * 0.6);
    breakdown.push({
      id: 'dsr-acreage',
      labelEn: `DSR Cash Incentive (₹1,500/acre for ${cropAcreage} acres)`,
      labelPa: `ਝੋਨੇ ਦੀ ਸਿੱਧੀ ਬਿਜਾਈ (DSR) ਭੱਤਾ (${cropAcreage} ਏਕੜ × ₹1,500)`,
      labelHi: `धान की सीधी बुवाई (DSR) प्रोत्साहन (${cropAcreage} एकड़ × ₹1,500)`,
      annualAmount: dsrGrant,
      totalAmount: dsrGrant * durationYears,
      formulaText: `${cropAcreage} acres × ₹1,500/acre × ${durationYears} yr(s)`,
    });
    breakdown.push({
      id: 'solar-pump-sub',
      labelEn: 'One-Time PEDA Solar Pump Capital Subsidy (60%)',
      labelPa: 'ਪੇਡਾ ਸੋਲਰ ਪੰਪ ਇੱਕਮੁਸ਼ਤ ਸਬਸਿਡੀ (60%)',
      labelHi: 'पेडा सोलर पंप एकमुश्त सब्सिडी (60%)',
      annualAmount: solarPumpSubsidy,
      totalAmount: solarPumpSubsidy,
      formulaText: `60% of ₹${Math.min(loanOrProjectAmount, 250000).toLocaleString('en-IN')} pump cost`,
    });
  }
  // 3. PM Fasal Bima Yojana (Crop Insurance)
  else if (id === 'pm-fasal-bima-yojana') {
    relevantFields = ['cropAcreage', 'familySize', 'durationYears'];
    // Govt pays ~₹3,800/acre actuarial premium subsidy + ₹35,000/acre sum insured cover
    const premiumSubsidy = Math.round(cropAcreage * 3800);
    const riskCover = Math.round(cropAcreage * 8500);
    breakdown.push({
      id: 'pmfby-premium',
      labelEn: `Govt Actuarial Premium Subsidy (${cropAcreage} Acres)`,
      labelPa: `ਸਰਕਾਰੀ ਫ਼ਸਲ ਬੀਮਾ ਪ੍ਰੀਮੀਅਮ ਸਬਸਿਡੀ (${cropAcreage} ਏਕੜ)`,
      labelHi: `सरकारी प्रीमियम सब्सिडी (${cropAcreage} एकड़)`,
      annualAmount: premiumSubsidy,
      totalAmount: premiumSubsidy * durationYears,
      formulaText: `${cropAcreage} acres × ₹3,800/acre/yr`,
    });
    breakdown.push({
      id: 'pmfby-protection',
      labelEn: `Weather / Yield Loss Protection Value (${cropAcreage} Acres)`,
      labelPa: `ਫ਼ਸਲ ਖਰਾਬੇ ਦਾ ਸੁਰੱਖਿਆ ਕਵਰ (${cropAcreage} ਏਕੜ)`,
      labelHi: `फसल नुकसान सुरक्षा मूल्य (${cropAcreage} एकड़)`,
      annualAmount: riskCover,
      totalAmount: riskCover * durationYears,
      formulaText: `${cropAcreage} acres × ₹8,500 expected claim protection`,
    });
  }
  // 4. Punjab CRM Machinery Subsidy
  else if (id === 'punjab-crm-machinery') {
    relevantFields = ['cropAcreage', 'loanOrProjectAmount', 'durationYears'];
    const machineSubsidy = Math.min(150000, Math.round(loanOrProjectAmount * 0.5));
    const dieselSavings = Math.round(cropAcreage * 1800);
    breakdown.push({
      id: 'crm-capital',
      labelEn: '50% Individual Machinery Capital Subsidy (up to ₹1.50 Lakh)',
      labelPa: '50% ਖੇਤੀ ਮਸ਼ੀਨਰੀ ਸਬਸਿਡੀ (₹1.50 ਲੱਖ ਤੱਕ)',
      labelHi: '50% कृषि मशीनरी सब्सिडी (₹1.50 लाख तक)',
      annualAmount: machineSubsidy,
      totalAmount: machineSubsidy,
      formulaText: `50% of ₹${loanOrProjectAmount.toLocaleString('en-IN')} machine cost`,
    });
    breakdown.push({
      id: 'crm-acreage-saving',
      labelEn: `Super Seeder Sowing & Diesel Savings (${cropAcreage} Acres)`,
      labelPa: `ਸੁਪਰ ਸੀਡਰ ਬਿਜਾਈ ਅਤੇ ਡੀਜ਼ਲ ਬੱਚਤ (${cropAcreage} ਏਕੜ)`,
      labelHi: `सुपर सीडर बुवाई एवं डीजल बचत (${cropAcreage} एकड़)`,
      annualAmount: dieselSavings,
      totalAmount: dieselSavings * durationYears,
      formulaText: `${cropAcreage} acres × ₹1,800/acre × ${durationYears} yr(s)`,
    });
  }
  // 5. Punjab Dairy Development Subsidy
  else if (id === 'punjab-dairy-development-subsidy') {
    relevantFields = ['loanOrProjectAmount', 'familySize', 'durationYears'];
    const cattleSubsidy = Math.min(210000, Math.round(loanOrProjectAmount * 0.3333));
    const insuranceAndFeed = familySize * 3000;
    breakdown.push({
      id: 'dairy-cattle-sub',
      labelEn: '33.33% Milch Cattle Unit Capital Subsidy',
      labelPa: '33.33% ਦੁਧਾਰੂ ਪਸ਼ੂ ਖਰੀਦ ਸਬਸਿਡੀ',
      labelHi: '33.33% दुधारू पशु खरीद सब्सिडी',
      annualAmount: cattleSubsidy,
      totalAmount: cattleSubsidy,
      formulaText: `33.3% of ₹${loanOrProjectAmount.toLocaleString('en-IN')} project cost`,
    });
    breakdown.push({
      id: 'dairy-training',
      labelEn: 'Free Dairy Training, Cattle Insurance & Feed Support',
      labelPa: 'ਮੁਫ਼ਤ ਡੇਅਰੀ ਸਿਖਲਾਈ ਅਤੇ ਪਸ਼ੂ ਬੀਮਾ ਸਹਾਇਤਾ',
      labelHi: 'मुफ्त डेयरी प्रशिक्षण एवं पशु बीमा सहायता',
      annualAmount: insuranceAndFeed,
      totalAmount: insuranceAndFeed * durationYears,
      formulaText: `${familySize} family members × ₹3,000/yr`,
    });
  }
  // 6. Kisan Credit Card (KCC)
  else if (id === 'kisan-credit-card') {
    relevantFields = ['cropAcreage', 'loanOrProjectAmount', 'durationYears'];
    const recommendedLimit = Math.min(300000, Math.max(loanOrProjectAmount, Math.round(cropAcreage * 45000)));
    // 5% interest subvention (3% prompt repayment + 2% govt subvention: 9% -> 4%)
    const annualInterestSaved = Math.round(recommendedLimit * 0.05);
    breakdown.push({
      id: 'kcc-interest-sub',
      labelEn: `5% Annual Interest Subvention (4% Effective Rate on ₹${recommendedLimit.toLocaleString('en-IN')})`,
      labelPa: `5% ਸਾਲਾਨਾ ਵਿਆਜ ਛੋਟ (₹${recommendedLimit.toLocaleString('en-IN')} ਕਰਜ਼ਾ ਸੀਮਾ 'ਤੇ)`,
      labelHi: `5% वार्षिक ब्याज छूट (₹${recommendedLimit.toLocaleString('en-IN')} क्रेडिट सीमा पर)`,
      annualAmount: annualInterestSaved,
      totalAmount: annualInterestSaved * durationYears,
      formulaText: `5% saved/yr on ₹${recommendedLimit.toLocaleString('en-IN')} for ${cropAcreage} acres`,
    });
  }
  // 7. Punjab Smart Ration Card (NFSA Kanak-Dal)
  else if (id === 'punjab-smart-ration-card') {
    relevantFields = ['familySize', 'durationYears'];
    // 5 kg wheat per member per month = 60 kg/year/member @ ₹28/kg market value = ₹1,680/member/year
    const annualWheatValue = familySize * 5 * 12 * 28;
    const pulsesAndAttaDeliveryValue = familySize * 600;
    breakdown.push({
      id: 'ration-wheat',
      labelEn: `Free Monthly Wheat Entitlement (${familySize * 5} kg/month for ${familySize} members)`,
      labelPa: `ਮੁਫ਼ਤ ਕਣਕ ਕੋਟਾ (${familySize} ਜੀਅ × 5 ਕਿਲੋ/ਮਹੀਨਾ)`,
      labelHi: `मुफ्त मासिक गेहूं कोटा (${familySize} सदस्य × 5 किग्रा/माह)`,
      annualAmount: annualWheatValue,
      totalAmount: annualWheatValue * durationYears,
      formulaText: `${familySize} members × 60 kg/yr × ₹28/kg × ${durationYears} yr(s)`,
    });
    breakdown.push({
      id: 'ration-doorstep',
      labelEn: 'Doorstep Atta / Fair Price Subsidy Savings',
      labelPa: 'ਘਰ-ਘਰ ਆਟਾ / ਡਿਪੂ ਸਬਸਿਡੀ ਬੱਚਤ',
      labelHi: 'राशन डिपो सब्सिडी बचत',
      annualAmount: pulsesAndAttaDeliveryValue,
      totalAmount: pulsesAndAttaDeliveryValue * durationYears,
      formulaText: `${familySize} members × ₹600/yr × ${durationYears} yr(s)`,
    });
  }
  // 8. Punjab 300 Units Free Electricity Scheme
  else if (id === 'punjab-free-300-units-electricity') {
    relevantFields = ['monthlyElectricityUnits', 'familySize', 'durationYears'];
    const freeUnitsPerMonth = Math.min(300, monthlyElectricityUnits);
    // Average PSPCL domestic tariff + fixed charge waiver ~₹6.50/unit
    const annualBillSaved = Math.round(freeUnitsPerMonth * 12 * 6.5);
    breakdown.push({
      id: 'pspcl-zero-bill',
      labelEn: `PSPCL Free Electricity Savings (${freeUnitsPerMonth} free units/month)`,
      labelPa: `ਪੀ.ਐਸ.ਪੀ.ਸੀ.ਐਲ ਮੁਫ਼ਤ ਬਿਜਲੀ ਬੱਚਤ (${freeUnitsPerMonth} ਯੂਨਿਟ/ਮਹੀਨਾ)`,
      labelHi: `पीएसपीसीएल मुफ्त बिजली बचत (${freeUnitsPerMonth} यूनिट/माह)`,
      annualAmount: annualBillSaved,
      totalAmount: annualBillSaved * durationYears,
      formulaText: `${freeUnitsPerMonth} units/mo × 12 mos × ₹6.50/unit × ${durationYears} yr(s)`,
    });
  }
  // 9. PM Surya Ghar Rooftop Solar Subsidy
  else if (id === 'ai-pm-surya-ghar-punjab-2026') {
    relevantFields = ['monthlyElectricityUnits', 'familySize', 'durationYears'];
    const kwNeeded = monthlyElectricityUnits <= 150 ? 1 : monthlyElectricityUnits <= 300 ? 2 : 3;
    const solarSubsidy = kwNeeded === 1 ? 30000 : kwNeeded === 2 ? 60000 : 78000;
    const annualSolarSavings = Math.round(Math.min(monthlyElectricityUnits, kwNeeded * 120) * 12 * 7);
    breakdown.push({
      id: 'surya-capital-sub',
      labelEn: `Direct Bank Rooftop Solar Subsidy (${kwNeeded} kW System)`,
      labelPa: `ਸਿੱਧੀ ਬੈਂਕ ਸੋਲਰ ਸਬਸਿਡੀ (${kwNeeded} ਕਿਲੋਵਾਟ ਸਿਸਟਮ)`,
      labelHi: `प्रत्यक्ष बैंक रूफटॉप सोलर सब्सिडी (${kwNeeded} किलोवाट सिस्टम)`,
      annualAmount: solarSubsidy,
      totalAmount: solarSubsidy,
      formulaText: `One-time MNRE grant for ${kwNeeded} kW rooftop plant`,
    });
    breakdown.push({
      id: 'surya-power-saving',
      labelEn: 'Annual Solar Electricity Generation Value',
      labelPa: 'ਸਾਲਾਨਾ ਸੋਲਰ ਬਿਜਲੀ ਉਤਪਾਦਨ ਬੱਚਤ',
      labelHi: 'वार्षिक सौर बिजली उत्पादन बचत',
      annualAmount: annualSolarSavings,
      totalAmount: annualSolarSavings * durationYears,
      formulaText: `${kwNeeded * 120} units/mo × 12 mos × ₹7/unit × ${durationYears} yr(s)`,
    });
  }
  // 10. Pensions (Old Age, Widow, Disability, PM-SYM)
  else if (
    id === 'punjab-old-age-pension' ||
    id === 'punjab-widow-pension' ||
    id === 'punjab-disability-pension' ||
    id === 'pm-shram-yogi-maandhan' ||
    scheme.benefitType === 'Pension'
  ) {
    relevantFields = ['familySize', 'eligibleMembersInFamily', 'durationYears'];
    const monthlyRate = id === 'pm-shram-yogi-maandhan' ? 3000 : 1500;
    const annualPension = monthlyRate * 12 * eligibleMembers;
    breakdown.push({
      id: 'pension-dbt',
      labelEn: `Monthly Pension DBT (₹${monthlyRate.toLocaleString('en-IN')}/mo × ${eligibleMembers} beneficiary)`,
      labelPa: `ਮਹੀਨਾਵਾਰ ਪੈਨਸ਼ਨ ਭੁਗਤਾਨ (₹${monthlyRate.toLocaleString('en-IN')}/ਮਹੀਨਾ × ${eligibleMembers} ਲਾਭਪਾਤਰੀ)`,
      labelHi: `मासिक पेंशन भुगतान (₹${monthlyRate.toLocaleString('en-IN')}/माह × ${eligibleMembers} लाभार्थी)`,
      annualAmount: annualPension,
      totalAmount: annualPension * durationYears,
      formulaText: `₹${monthlyRate.toLocaleString('en-IN')} × 12 months × ${eligibleMembers} member(s) × ${durationYears} yr(s)`,
    });
  }
  // 11. MGNREGA
  else if (id === 'mgnrega-punjab') {
    relevantFields = ['workDaysPerYear', 'familySize', 'durationYears'];
    const dailyWage = 322; // Notified Punjab MGNREGA wage rate
    const annualWages = workDaysPerYear * dailyWage;
    breakdown.push({
      id: 'mgnrega-wages',
      labelEn: `Guaranteed Rural Wage Earnings (${workDaysPerYear} days @ ₹${dailyWage}/day)`,
      labelPa: `ਮਨਰੇਗਾ ਗਾਰੰਟੀਸ਼ੁਦਾ ਦਿਹਾੜੀ ਆਮਦਨ (${workDaysPerYear} ਦਿਨ × ₹${dailyWage})`,
      labelHi: `मनरेगा गारंटीकृत मजदूरी आय (${workDaysPerYear} दिन × ₹${dailyWage})`,
      annualAmount: annualWages,
      totalAmount: annualWages * durationYears,
      formulaText: `${workDaysPerYear} days × ₹${dailyWage}/day × ${durationYears} yr(s)`,
    });
  }
  // 12. Scholarships & Student Schemes
  else if (scheme.benefitType === 'Scholarship') {
    relevantFields = ['eligibleMembersInFamily', 'annualTuitionFee', 'durationYears'];
    if (id === 'post-matric-sc') {
      const feeWaiver = annualTuitionFee * eligibleMembers;
      const allowance = 13500 * eligibleMembers;
      breakdown.push({
        id: 'sc-tuition-waiver',
        labelEn: '100% College / University Tuition Fee Waiver (Freeship Card)',
        labelPa: '100% ਕਾਲਜ / ਯੂਨੀਵਰਸਿਟੀ ਟਿਊਸ਼ਨ ਫੀਸ ਮੁਆਫੀ',
        labelHi: '100% कॉलेज / विश्वविद्यालय ट्यूशन फीस माफी',
        annualAmount: feeWaiver,
        totalAmount: feeWaiver * durationYears,
        formulaText: `₹${annualTuitionFee.toLocaleString('en-IN')}/yr × ${eligibleMembers} student(s) × ${durationYears} yr(s)`,
      });
      breakdown.push({
        id: 'sc-maintenance',
        labelEn: 'Annual Academic Maintenance & Hostel Allowance',
        labelPa: 'ਸਾਲਾਨਾ ਪੜ੍ਹਾਈ ਅਤੇ ਹੋਸਟਲ ਗੁਜ਼ਾਰਾ ਭੱਤਾ',
        labelHi: 'वार्षिक शैक्षणिक एवं छात्रावास भत्ता',
        annualAmount: allowance,
        totalAmount: allowance * durationYears,
        formulaText: `₹13,500/yr × ${eligibleMembers} student(s) × ${durationYears} yr(s)`,
      });
    } else if (id === 'aicte-pragati-saksham-scholarship') {
      const grant = 50000 * eligibleMembers;
      breakdown.push({
        id: 'aicte-grant',
        labelEn: 'AICTE Pragati / Saksham Annual Direct Scholarship',
        labelPa: 'ਏ.ਆਈ.ਸੀ.ਟੀ.ਈ ਪ੍ਰਗਤੀ / ਸਕਸ਼ਮ ਸਾਲਾਨਾ ਵਜ਼ੀਫ਼ਾ',
        labelHi: 'एआईसीटीई प्रगति / सक्षम वार्षिक छात्रवृत्ति',
        annualAmount: grant,
        totalAmount: grant * durationYears,
        formulaText: `₹50,000/yr × ${eligibleMembers} student(s) × ${durationYears} yr(s)`,
      });
    } else if (id === 'dr-hargobind-khurana-scholarship') {
      const grant = 30000 * eligibleMembers;
      breakdown.push({
        id: 'khurana-grant',
        labelEn: 'Dr. Hargobind Khurana Merit Scholarship (₹2,500/month)',
        labelPa: 'ਡਾ. ਹਰਗੋਬਿੰਦ ਖੁਰਾਨਾ ਮੈਰਿਟ ਵਜ਼ੀਫ਼ਾ (₹2,500/ਮਹੀਨਾ)',
        labelHi: 'डॉ. हरगोबिंद खुराना मेरिट छात्रवृत्ति (₹2,500/माह)',
        annualAmount: grant,
        totalAmount: grant * durationYears,
        formulaText: `₹30,000/yr × ${eligibleMembers} student(s) × ${durationYears} yr(s)`,
      });
    } else if (id === 'ai-punjab-cm-young-intern-2026') {
      const laptopVoucher = 25000 * eligibleMembers;
      const annualStipend = 120000 * eligibleMembers;
      breakdown.push({
        id: 'intern-stipend',
        labelEn: 'Monthly Youth Internship Stipend (₹10,000/month)',
        labelPa: 'ਮਹੀਨਾਵਾਰ ਇੰਟਰਨਸ਼ਿਪ ਭੱਤਾ (₹10,000/ਮਹੀਨਾ)',
        labelHi: 'मासिक युवा इंटर्नशिप स्टाइपेंड (₹10,000/माह)',
        annualAmount: annualStipend,
        totalAmount: annualStipend * durationYears,
        formulaText: `₹10,000 × 12 mos × ${eligibleMembers} student(s) × ${durationYears} yr(s)`,
      });
      breakdown.push({
        id: 'laptop-voucher',
        labelEn: 'One-Time Digital Laptop / Tablet e-RUPI Voucher',
        labelPa: 'ਇੱਕਮੁਸ਼ਤ ਡਿਜੀਟਲ ਲੈਪਟਾਪ ਵਾਊਚਰ',
        labelHi: 'एकमुश्त डिजिटल लैपटॉप वाउचर',
        annualAmount: laptopVoucher,
        totalAmount: laptopVoucher,
        formulaText: `₹25,000 one-time × ${eligibleMembers} student(s)`,
      });
    } else if (id === 'ai-pm-internship-scheme-2026') {
      const annualStipend = 60000 * eligibleMembers;
      const joiningGrant = 6000 * eligibleMembers;
      breakdown.push({
        id: 'pmis-stipend',
        labelEn: 'PM Internship Monthly Allowance (₹5,000/month)',
        labelPa: 'ਪੀ.ਐਮ ਇੰਟਰਨਸ਼ਿਪ ਮਹੀਨਾਵਾਰ ਭੱਤਾ (₹5,000/ਮਹੀਨਾ)',
        labelHi: 'पीएम इंटर्नशिप मासिक भत्ता (₹5,000/माह)',
        annualAmount: annualStipend,
        totalAmount: annualStipend * durationYears,
        formulaText: `₹5,000 × 12 mos × ${eligibleMembers} intern(s)`,
      });
      breakdown.push({
        id: 'pmis-joining',
        labelEn: 'One-Time Joining & Incidental Grant',
        labelPa: 'ਇੱਕਮੁਸ਼ਤ ਜੁਆਇਨਿੰਗ ਗ੍ਰਾਂਟ',
        labelHi: 'एकमुश्त जॉइनिंग अनुदान',
        annualAmount: joiningGrant,
        totalAmount: joiningGrant,
        formulaText: `₹6,000 one-time × ${eligibleMembers} intern(s)`,
      });
    } else {
      const baseScholarship = (id === 'pm-usp-college-scholarship' ? 16000 : 12000) * eligibleMembers;
      const partialFeeSupport = Math.min(20000, Math.round(annualTuitionFee * 0.4)) * eligibleMembers;
      breakdown.push({
        id: 'scholarship-base',
        labelEn: 'Annual Direct Scholarship Stipend',
        labelPa: 'ਸਾਲਾਨਾ ਸਿੱਧਾ ਵਜ਼ੀਫ਼ਾ ਭੱਤਾ',
        labelHi: 'वार्षिक प्रत्यक्ष छात्रवृत्ति भत्ता',
        annualAmount: baseScholarship,
        totalAmount: baseScholarship * durationYears,
        formulaText: `₹${(baseScholarship / eligibleMembers).toLocaleString('en-IN')}/yr × ${eligibleMembers} student(s) × ${durationYears} yr(s)`,
      });
      breakdown.push({
        id: 'scholarship-fee',
        labelEn: 'Tuition & Book Allowance Support',
        labelPa: 'ਟਿਊਸ਼ਨ ਫੀਸ ਅਤੇ ਕਿਤਾਬਾਂ ਦੀ ਸਹਾਇਤਾ',
        labelHi: 'ट्यूशन शुल्क एवं पुस्तक सहायता',
        annualAmount: partialFeeSupport,
        totalAmount: partialFeeSupport * durationYears,
        formulaText: `40% of tuition (up to ₹20,000/yr) × ${eligibleMembers} student(s)`,
      });
    }
  }
  // 13. Health Cover (Ayushman Bharat / Cancer Relief)
  else if (scheme.benefitType === 'Health Cover') {
    relevantFields = ['familySize', 'durationYears'];
    const baseCover = id === 'punjab-cm-cancer-relief' ? 150000 : 500000;
    // Out-of-pocket diagnostic & medicine savings scaled by family size
    const familyOpdDiagnosticValue = familySize * 3500;
    breakdown.push({
      id: 'health-floater',
      labelEn: 'Annual Cashless Hospitalization Cover Pool',
      labelPa: 'ਸਾਲਾਨਾ ਮੁਫ਼ਤ ਨਕਦੀ-ਰਹਿਤ ਹਸਪਤਾਲ ਇਲਾਜ ਕਵਰ',
      labelHi: 'वार्षिक कैशलेस अस्पताल उपचार कवर',
      annualAmount: baseCover,
      totalAmount: baseCover,
      formulaText: `Up to ₹${baseCover.toLocaleString('en-IN')}/yr family floater cover`,
    });
    breakdown.push({
      id: 'health-family-premium',
      labelEn: `Equivalent Private Insurance Premium & Medicine Savings (${familySize} Members)`,
      labelPa: `ਪਰਿਵਾਰਕ ਸਿਹਤ ਬੀਮਾ ਪ੍ਰੀਮੀਅਮ ਅਤੇ ਦਵਾਈਆਂ ਦੀ ਬੱਚਤ (${familySize} ਜੀਅ)`,
      labelHi: `पारिवारिक स्वास्थ्य बीमा प्रीमियम एवं दवा बचत (${familySize} सदस्य)`,
      annualAmount: familyOpdDiagnosticValue,
      totalAmount: familyOpdDiagnosticValue * durationYears,
      formulaText: `${familySize} members × ₹3,500/yr × ${durationYears} yr(s)`,
    });
  }
  // 14. Housing (PMAY-G & PMAY-Urban)
  else if (scheme.benefitType === 'Housing') {
    relevantFields = ['familySize', 'workDaysPerYear'];
    const baseGrant = id === 'punjab-shehri-awas' ? 150000 : 120000;
    const wageComponent = workDaysPerYear * 322;
    const sanitationGrant = 12000;
    breakdown.push({
      id: 'housing-grant',
      labelEn: 'Direct Pucca House Construction Grant (3 Installments)',
      labelPa: 'ਪੱਕਾ ਮਕਾਨ ਉਸਾਰੀ ਸਿੱਧੀ ਗ੍ਰਾਂਟ (3 ਕਿਸ਼ਤਾਂ)',
      labelHi: 'पक्का मकान निर्माण प्रत्यक्ष अनुदान (3 किस्तें)',
      annualAmount: baseGrant,
      totalAmount: baseGrant,
      formulaText: `One-time ₹${baseGrant.toLocaleString('en-IN')} DBT construction grant`,
    });
    breakdown.push({
      id: 'housing-wages',
      labelEn: `MGNREGA Construction Wage Support (${workDaysPerYear} days)`,
      labelPa: `ਮਨਰੇਗਾ ਮਜ਼ਦੂਰੀ ਸਹਾਇਤਾ (${workDaysPerYear} ਦਿਨ)`,
      labelHi: `मनरेगा निर्माण मजदूरी सहायता (${workDaysPerYear} दिन)`,
      annualAmount: wageComponent,
      totalAmount: wageComponent,
      formulaText: `${workDaysPerYear} days × ₹322/day`,
    });
    breakdown.push({
      id: 'housing-toilet',
      labelEn: 'Swachh Bharat Toilet & Utility Assistance',
      labelPa: 'ਪਖਾਨਾ ਅਤੇ ਬੁਨਿਆਦੀ ਸਹੂਲਤ ਗ੍ਰਾਂਟ',
      labelHi: 'स्वच्छ भारत शौचालय निर्माण सहायता',
      annualAmount: sanitationGrant,
      totalAmount: sanitationGrant,
      formulaText: `₹12,000 household sanitation grant (${familySize} members)`,
    });
  }
  // 15. PM Vishwakarma
  else if (id === 'pm-vishwakarma') {
    relevantFields = ['loanOrProjectAmount', 'workDaysPerYear', 'durationYears'];
    const toolkit = 15000;
    const trainingStipend = Math.min(15, workDaysPerYear) * 500;
    const interestSaved = Math.round(Math.min(300000, loanOrProjectAmount) * 0.08);
    breakdown.push({
      id: 'vishwakarma-toolkit',
      labelEn: 'Modern Toolkit e-Voucher Grant',
      labelPa: 'ਆਧੁਨਿਕ ਔਜ਼ਾਰ (ਟੂਲਕਿੱਟ) ਈ-ਵਾਊਚਰ ਗ੍ਰਾਂਟ',
      labelHi: 'आधुनिक टूलकिट ई-वाउचर अनुदान',
      annualAmount: toolkit,
      totalAmount: toolkit,
      formulaText: '₹15,000 one-time e-RUPI toolkit voucher',
    });
    breakdown.push({
      id: 'vishwakarma-stipend',
      labelEn: 'Skill Training Stipend (₹500/day)',
      labelPa: 'ਹੁਨਰ ਸਿਖਲਾਈ ਭੱਤਾ (₹500/ਦਿਨ)',
      labelHi: 'कौशल प्रशिक्षण वजीफा (₹500/दिन)',
      annualAmount: trainingStipend,
      totalAmount: trainingStipend,
      formulaText: `${Math.min(15, workDaysPerYear)} training days × ₹500/day`,
    });
    breakdown.push({
      id: 'vishwakarma-loan-sub',
      labelEn: '8% Interest Subvention on 5% Concessional Enterprise Loan',
      labelPa: '5% ਸਸਤੇ ਕਰਜ਼ੇ ਤੇ 8% ਵਿਆਜ ਸਬਸਿਡੀ ਬੱਚਤ',
      labelHi: '5% रियायती ऋण पर 8% ब्याज सब्सिडी बचत',
      annualAmount: interestSaved,
      totalAmount: interestSaved * durationYears,
      formulaText: `8% saved/yr on ₹${Math.min(300000, loanOrProjectAmount).toLocaleString('en-IN')} × ${durationYears} yr(s)`,
    });
  }
  // 16. Loans, Credit & Enterprise Subsidies (Mudra, PSCFC, Vidyalaxmi, Stand-Up India, PMEGP, etc.)
  else if (scheme.benefitType === 'Loan/Credit' || scheme.benefitType === 'Subsidy') {
    relevantFields = ['loanOrProjectAmount', 'familySize', 'durationYears'];
    const capitalSubsidyRate =
      id === 'punjab-pscfc-loan'
        ? 0.2
        : id === 'ai-pmegp-msme-subsidy-2026'
          ? 0.35
          : id === 'pm-vidyalaxmi-education-loan'
            ? 0
            : 0.15;
    const capitalSubsidy = Math.min(
      id === 'punjab-pscfc-loan' ? 50000 : 350000,
      Math.round(loanOrProjectAmount * capitalSubsidyRate)
    );
    const interestSubvention = Math.round(loanOrProjectAmount * 0.06);
    if (capitalSubsidy > 0) {
      breakdown.push({
        id: 'loan-capital-sub',
        labelEn: `Direct Capital Grant / Margin Money Subsidy (${Math.round(capitalSubsidyRate * 100)}%)`,
        labelPa: `ਸਿੱਧੀ ਪੂੰਜੀ ਸਬਸਿਡੀ ਗ੍ਰਾਂਟ (${Math.round(capitalSubsidyRate * 100)}%)`,
        labelHi: `प्रत्यक्ष पूंजी सब्सिडी अनुदान (${Math.round(capitalSubsidyRate * 100)}%)`,
        annualAmount: capitalSubsidy,
        totalAmount: capitalSubsidy,
        formulaText: `${Math.round(capitalSubsidyRate * 100)}% of ₹${loanOrProjectAmount.toLocaleString('en-IN')}`,
      });
    }
    breakdown.push({
      id: 'loan-interest-sub',
      labelEn: 'Annual Concessional Interest Subvention & Collateral Guarantee',
      labelPa: 'ਸਾਲਾਨਾ ਵਿਆਜ ਛੋਟ ਅਤੇ ਬਿਨਾਂ ਗਰੰਟੀ ਕਰਜ਼ਾ ਬੱਚਤ',
      labelHi: 'वार्षिक रियायती ब्याज छूट एवं क्रेडिट गारंटी बचत',
      annualAmount: interestSubvention,
      totalAmount: interestSubvention * durationYears,
      formulaText: `6% interest saved/yr on ₹${loanOrProjectAmount.toLocaleString('en-IN')} × ${durationYears} yr(s)`,
    });
  }
  // 17. Direct Cash Transfers & In-Kind (Ashirwad, Mera Kaam Mera Maan, Ujjwala, Free Bus Travel, etc.)
  else {
    relevantFields = ['familySize', 'eligibleMembersInFamily', 'durationYears'];
    if (id === 'punjab-ashirwad') {
      const grant = 51000 * eligibleMembers;
      breakdown.push({
        id: 'ashirwad-grant',
        labelEn: 'Punjab Ashirwad (Shagun) Marriage Grant',
        labelPa: 'ਪੰਜਾਬ ਅਸ਼ੀਰਵਾਦ (ਸ਼ਗਨ) ਵਿਆਹ ਗ੍ਰਾਂਟ',
        labelHi: 'पंजाब आशीर्वाद (शगुन) विवाह अनुदान',
        annualAmount: grant,
        totalAmount: grant,
        formulaText: `₹51,000 × ${eligibleMembers} eligible daughter(s)`,
      });
    } else if (id === 'punjab-mera-kaam-mera-maan') {
      const allowance = 30000 * eligibleMembers;
      breakdown.push({
        id: 'mkmm-stipend',
        labelEn: 'Mera Kaam Mera Maan Stipend (₹2,500/month × 12 months)',
        labelPa: 'ਮੇਰਾ ਕੰਮ ਮੇਰਾ ਮਾਣ ਭੱਤਾ (₹2,500/ਮਹੀਨਾ × 12 ਮਹੀਨੇ)',
        labelHi: 'मेरा काम मेरा मान भत्ता (₹2,500/माह × 12 माह)',
        annualAmount: allowance,
        totalAmount: allowance,
        formulaText: `₹2,500 × 12 months × ${eligibleMembers} youth`,
      });
    } else if (id === 'pm-ujjwala') {
      const connectionGrant = 3200;
      const refillSubsidy = Math.min(12, familySize * 2) * 300;
      breakdown.push({
        id: 'ujjwala-conn',
        labelEn: 'Free LPG Cylinder Connection + Stove + First Refill',
        labelPa: 'ਮੁਫ਼ਤ ਐਲ.ਪੀ.ਜੀ ਸਿਲੰਡਰ ਕੁਨੈਕਸ਼ਨ ਅਤੇ ਚੁੱਲ੍ਹਾ',
        labelHi: 'मुफ्त एलपीजी सिलेंडर कनेक्शन और चूल्हा',
        annualAmount: connectionGrant,
        totalAmount: connectionGrant,
        formulaText: '₹3,200 one-time connection & hotplate benefit',
      });
      breakdown.push({
        id: 'ujjwala-refill',
        labelEn: `Targeted ₹300/Cylinder Refill Subsidy (${Math.min(12, familySize * 2)} cylinders/yr)`,
        labelPa: `₹300 ਪ੍ਰਤੀ ਸਿਲੰਡਰ ਰੀਫਿਲ ਸਬਸਿਡੀ (${Math.min(12, familySize * 2)} ਸਿਲੰਡਰ/ਸਾਲ)`,
        labelHi: `₹300 प्रति सिलेंडर रिफिल सब्सिडी (${Math.min(12, familySize * 2)} सिलेंडर/वर्ष)`,
        annualAmount: refillSubsidy,
        totalAmount: refillSubsidy * durationYears,
        formulaText: `${Math.min(12, familySize * 2)} refills/yr × ₹300 × ${durationYears} yr(s)`,
      });
    } else if (id === 'punjab-free-bus-travel-women') {
      const annualTravelSaved = eligibleMembers * 14400; // ₹1,200/month PRTC/Punbus commute savings
      breakdown.push({
        id: 'bus-pass-women',
        labelEn: `100% Free PRTC / Punbus / City Bus Travel (${eligibleMembers} Women/Girls)`,
        labelPa: `100% ਮੁਫ਼ਤ ਸਰਕਾਰੀ ਬੱਸ ਸਫ਼ਰ ਬੱਚਤ (${eligibleMembers} ਮਹਿਲਾਵਾਂ/ਵਿਦਿਆਰਥਣਾਂ)`,
        labelHi: `100% मुफ्त सरकारी बस यात्रा बचत (${eligibleMembers} महिलाएं/छात्राएं)`,
        annualAmount: annualTravelSaved,
        totalAmount: annualTravelSaved * durationYears,
        formulaText: `${eligibleMembers} member(s) × ₹1,200/mo × 12 mos × ${durationYears} yr(s)`,
      });
    } else {
      const baseBenefit = 15000 * eligibleMembers;
      breakdown.push({
        id: 'direct-benefit',
        labelEn: 'Direct Welfare Entitlement Value',
        labelPa: 'ਸਿੱਧੀ ਭਲਾਈ ਵਿੱਤੀ ਸਹਾਇਤਾ',
        labelHi: 'प्रत्यक्ष कल्याण वित्तीय सहायता',
        annualAmount: baseBenefit,
        totalAmount: baseBenefit * durationYears,
        formulaText: `₹15,000 × ${eligibleMembers} beneficiary × ${durationYears} yr(s)`,
      });
    }
  }

  const annualBenefit = breakdown.reduce((sum, item) => sum + item.annualAmount, 0);
  const totalProjectedBenefit = breakdown.reduce((sum, item) => sum + item.totalAmount, 0);
  const monthlyEquivalent = Math.round(annualBenefit / 12);

  return {
    schemeId: scheme.id,
    annualBenefit,
    totalProjectedBenefit,
    monthlyEquivalent,
    relevantFields,
    breakdown,
    summaryNoteEn: `Estimated for ${familySize} family member(s), ${cropAcreage} acre(s), over ${durationYears} year(s) based on official scheme guidelines.`,
    summaryNotePa: `${familySize} ਪਰਿਵਾਰਕ ਮੈਂਬਰਾਂ, ${cropAcreage} ਏਕੜ ਜ਼ਮੀਨ ਅਤੇ ${durationYears} ਸਾਲਾਂ ਦੇ ਆਧਾਰ 'ਤੇ ਅੰਦਾਜ਼ਨ ਵਿੱਤੀ ਲਾਭ।`,
    summaryNoteHi: `${familySize} परिवार के सदस्यों, ${cropAcreage} एकड़ भूमि और ${durationYears} वर्ष की अवधि के आधार पर अनुमानित लाभ।`,
  };
}
