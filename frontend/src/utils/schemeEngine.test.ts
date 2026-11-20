import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSchemeEligibility, evaluateAllSchemes, simulateWhatIf, aggregateMissingDocuments } from './schemeEngine';
import { CitizenProfile, Scheme } from '../types/scheme';
import { GOV_SCHEMES } from '../data/schemes';
import { INDIAN_22_LANGUAGES, getIndianLanguageConfig, detectQueryTopicIn22Languages } from './indianLanguages';
import { generateOfflineChatReply } from './offlineCache';
import {
  normalizeIndianPhoneNumber,
  buildSchemePhoneAlertText,
  dispatchSchemeAlertToPhone,
  dispatchAiProfileActivitySms,
  syncActiveLoggedInUser,
  resetOneTimeAlertLockForUser,
} from './phoneAlertService';
import {
  filterSchemesAdvanced,
  DEFAULT_ADVANCED_FILTERS,
  countActiveAdvancedFilters,
  countSchemesBySectorCategory,
  DASHBOARD_SECTOR_CATEGORIES,
  isSchemeForSeniors,
  matchesCategoryFilter,
  extractNumericBenefitAmount,
  computeSchemeNewestRank,
  computeSchemePopularityScore,
  sortSchemeEvaluations,
} from './advancedSchemeFilter';
import { analyzePhotoJawabInput, detectPhotoJawabCategory } from './photoJawabHelper';
import {
  toggleSchemeInComparison,
  buildSchemeComparisonMatrix,
  MAX_COMPARISON_SCHEMES,
} from './schemeComparison';
import {
  buildSavedSchemeDeadlineNotifications,
  createStatusChangeNotification,
  mergeAndSortNotifications,
  countUnreadNotifications,
} from './schemeNotifications';

test('schemeEngine: PM-Kisan eligibility for small landholding farmer', () => {
  const farmerProfile: CitizenProfile = {
    username: '',
    age: 42,
    gender: 'Male',
    occupation: 'Farmer',
    annualIncome: 120000,
    category: 'General',
    district: 'Ludhiana',
    isPunjabDomicile: true,
    landholdingAcres: 3.5,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: false
  };

  const pmKisan = GOV_SCHEMES.find(s => s.id === 'pm-kisan')!;
  assert.ok(pmKisan, 'PM-Kisan scheme must exist');

  const result = evaluateSchemeEligibility(farmerProfile, pmKisan);
  assert.equal(result.isEligible, true);
  assert.ok(result.matchPercentage >= 80);
  assert.ok(result.matchedReasons.some(r => r.includes('Landholding')));
});

test('schemeEngine: Post Matric SC Scholarship requires SC category and Student occupation', () => {
  const scStudent: CitizenProfile = {
    username: '',
    age: 20,
    gender: 'Female',
    occupation: 'Student',
    annualIncome: 180000,
    category: 'SC',
    district: 'Jalandhar',
    isPunjabDomicile: true,
    landholdingAcres: 0,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: true
  };

  const postMatric = GOV_SCHEMES.find(s => s.id === 'post-matric-sc')!;
  assert.ok(postMatric, 'Post matric scheme must exist');

  const eligibleResult = evaluateSchemeEligibility(scStudent, postMatric);
  assert.equal(eligibleResult.isEligible, true);

  // If category changed to General, must not be eligible for SC scholarship
  const generalStudent: CitizenProfile = { ...scStudent, category: 'General' };
  const ineligibleResult = evaluateSchemeEligibility(generalStudent, postMatric);
  assert.equal(ineligibleResult.isEligible, false);
  assert.ok(ineligibleResult.failedReasons.some(r => r.includes('Reserved for SC')));
});

test('schemeEngine: Old Age Pension checks minAge and income ceiling', () => {
  const seniorCitizen: CitizenProfile = {
    username: '',
    age: 68,
    gender: 'Male',
    occupation: 'Senior Citizen',
    annualIncome: 45000,
    category: 'General',
    district: 'Bathinda',
    isPunjabDomicile: true,
    landholdingAcres: 0,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: false
  };

  const oldAgeScheme = GOV_SCHEMES.find(s => s.id === 'punjab-old-age-pension')!;
  const result = evaluateSchemeEligibility(seniorCitizen, oldAgeScheme);
  assert.equal(result.isEligible, true);

  // If income exceeds 60,000 ceiling
  const richSenior: CitizenProfile = { ...seniorCitizen, annualIncome: 200000 };
  const richResult = evaluateSchemeEligibility(richSenior, oldAgeScheme);
  assert.equal(richResult.isEligible, false);
});

test('schemeEngine: What-If simulation detects gained and lost schemes', () => {
  const lowIncomeProfile: CitizenProfile = {
    username: '',
    age: 25,
    gender: 'Female',
    occupation: 'Unemployed Youth',
    annualIncome: 50000,
    category: 'SC',
    district: 'Amritsar',
    isPunjabDomicile: true,
    landholdingAcres: 0,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: false
  };

  const whatIf = simulateWhatIf(lowIncomeProfile, { annualIncome: 400000 });
  // Raising income to 400,000 should cause loss of low-income/BPL schemes (like Ashirwad, Smart Ration, PMAY-G)
  assert.ok(whatIf.lostSchemes.length > 0, 'Should lose low-income schemes when income increases');
});

test('schemeEngine: Missing documents aggregator computes readiness percentage', () => {
  const profile: CitizenProfile = {
    username: '',
    age: 30,
    gender: 'Male',
    occupation: 'Farmer',
    annualIncome: 100000,
    category: 'General',
    district: 'Patiala',
    isPunjabDomicile: true,
    landholdingAcres: 4,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: false
  };

  const evaluations = evaluateAllSchemes(profile);
  const userDocs = new Set<string>(['aadhaar card linked with mobile']);

  const docSummary = aggregateMissingDocuments(evaluations, userDocs);
  assert.ok(docSummary.allDocs.length > 0);
  assert.ok(docSummary.ownedDocs.length >= 1);
  assert.ok(docSummary.missingDocs.length > 0);
  assert.ok(docSummary.readinessPercentage > 0 && docSummary.readinessPercentage <= 100);
});

test('schemeEngine: Selecting Student occupation or enrolled student status matches student scholarships', () => {
  const studentProfile: CitizenProfile = {
    username: 'Simran',
    age: 20,
    gender: 'Female',
    occupation: 'Student',
    annualIncome: 120000,
    category: 'General',
    district: 'Ludhiana',
    isPunjabDomicile: true,
    landholdingAcres: 0,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: true
  };

  const evaluations = evaluateAllSchemes(studentProfile);
  const eligibleStudentIds = evaluations.filter(e => e.isEligible).map(e => e.schemeId);
  assert.ok(eligibleStudentIds.includes('dr-hargobind-khurana-scholarship'));
  assert.ok(eligibleStudentIds.includes('pm-usp-college-scholarship'));
  assert.ok(eligibleStudentIds.includes('pm-vidyalaxmi-education-loan'));
  assert.ok(eligibleStudentIds.includes('aicte-pragati-saksham-scholarship'));
});

test('indianLanguages: all 22 Scheduled Indian Languages have native greetings, prompts, TTS/Speech fallbacks, and localized replies', () => {
  assert.equal(INDIAN_22_LANGUAGES.length, 22, 'Must support all 22 Scheduled Indian Languages');

  const sampleProfile: CitizenProfile = {
    username: 'Gurpreet',
    age: 35,
    gender: 'Female',
    occupation: 'Farmer',
    annualIncome: 95000,
    category: 'SC',
    district: 'Amritsar',
    isPunjabDomicile: true,
    landholdingAcres: 2.5,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: false
  };

  for (const lang of INDIAN_22_LANGUAGES) {
    const cfg = getIndianLanguageConfig(lang.code);
    assert.equal(cfg.code, lang.code);
    assert.ok(cfg.welcomeGreeting.length > 10, `Missing greeting for ${lang.nameEn}`);
    assert.ok(cfg.suggestedPrompts.length >= 3, `Need at least 3 suggested voice prompts for ${lang.nameEn}`);
    assert.ok(cfg.ttsVoiceFallbacks.length >= 1, `Need TTS fallback locales for ${lang.nameEn}`);
    assert.ok(cfg.speechRecognitionFallbacks.length >= 1, `Need SpeechRecognition fallback locales for ${lang.nameEn}`);

    // Verify clicking the first suggested prompt in that language produces a non-empty localized response
    const promptQuery = cfg.suggestedPrompts[0];
    const result = generateOfflineChatReply(promptQuery, lang.code, sampleProfile, GOV_SCHEMES);
    assert.ok(result.reply.length > 20, `Reply for ${lang.nameEn} (${lang.code}) should be detailed`);
  }

  // Verify specific native script topic detection across diverse scripts
  assert.equal(detectQueryTopicIn22Languages('প্রধানমন্ত্রী কিষাণ সম্মান নিধি').isFarmer, true);
  assert.equal(detectQueryTopicIn22Languages('முதியோர் ஓய்வூதியம் மற்றும் விதவை ஓய்வூதியம்').isPension, true);
  assert.equal(detectQueryTopicIn22Languages('छात्रवृत्ति योजना').isStudent, true);
  assert.equal(detectQueryTopicIn22Languages('آشرواد اسکیم شگن').isWomen, true);
});

test('phoneAlertService: enforces 1-time New Scheme SMS strictly for logged-in users with full in-website details', async () => {
  const validPhone = normalizeIndianPhoneNumber('+91 98765-43210');
  assert.equal(validPhone.isValid, true);
  assert.equal(validPhone.digits10, '9876543210');
  assert.equal(validPhone.e164, '+919876543210');

  const invalidPhone = normalizeIndianPhoneNumber('12345');
  assert.equal(invalidPhone.isValid, false);

  const scheme = GOV_SCHEMES[0];
  const newSchemeSmsPa = buildSchemePhoneAlertText({
    scheme,
    alertType: 'new_scheme',
    language: 'pa',
  });
  assert.ok(newSchemeSmsPa.includes('1100'));
  assert.ok(newSchemeSmsPa.includes(scheme.titlePa));
  assert.ok(newSchemeSmsPa.includes('Google'));
  assert.ok(newSchemeSmsPa.includes('JAN-AI-'));

  // 1. Non-new_scheme alerts are strictly blocked
  syncActiveLoggedInUser({ id: 'test-citizen-1', email: 'citizen@janshayak.in' });
  resetOneTimeAlertLockForUser('test-citizen-1');

  const deadlineBlocked = await dispatchSchemeAlertToPhone({
    phoneNumber: '9876543210',
    scheme,
    alertType: 'deadline',
    language: 'pa',
  });
  assert.equal(deadlineBlocked.ok, false);
  assert.equal(deadlineBlocked.skippedReason, 'only_new_scheme_allowed');

  // 2. Logged-out users are strictly blocked
  syncActiveLoggedInUser(null);
  const loggedOutBlocked = await dispatchSchemeAlertToPhone({
    phoneNumber: '9876543210',
    scheme,
    alertType: 'new_scheme',
    language: 'pa',
  });
  assert.equal(loggedOutBlocked.ok, false);
  assert.equal(loggedOutBlocked.skippedReason, 'login_required');

  // 3. Logged-in user receives the new_scheme message strictly 1 time, and 2nd attempt is blocked
  syncActiveLoggedInUser({ id: 'test-citizen-1', email: 'citizen@janshayak.in' });
  const firstSend = await dispatchSchemeAlertToPhone({
    phoneNumber: '9876543210',
    scheme,
    alertType: 'new_scheme',
    language: 'pa',
  });
  assert.equal(firstSend.ok, true);
  assert.ok(firstSend.message);

  const secondSendBlocked = await dispatchSchemeAlertToPhone({
    phoneNumber: '9876543210',
    scheme: GOV_SCHEMES[1],
    alertType: 'new_scheme',
    language: 'pa',
  });
  assert.equal(secondSendBlocked.ok, false);
  assert.equal(secondSendBlocked.skippedReason, 'already_sent_once');
});

test('advancedSchemeFilter: savedOnly toggles between all schemes and user-saved schemes', () => {
  const farmerProfile: CitizenProfile = {
    username: '',
    age: 42,
    gender: 'Male',
    occupation: 'Farmer',
    annualIncome: 120000,
    category: 'General',
    district: 'Ludhiana',
    isPunjabDomicile: true,
    landholdingAcres: 3.5,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: false,
  };

  const evaluations = evaluateAllSchemes(farmerProfile, GOV_SCHEMES);
  const savedSchemeIds = [GOV_SCHEMES[0].id, GOV_SCHEMES[1].id];

  const allFiltered = filterSchemesAdvanced(
    evaluations,
    { ...DEFAULT_ADVANCED_FILTERS, savedOnly: false },
    savedSchemeIds
  );
  assert.equal(allFiltered.length, GOV_SCHEMES.length);
  assert.equal(countActiveAdvancedFilters({ ...DEFAULT_ADVANCED_FILTERS, savedOnly: false }), 0);

  const savedOnlyFiltered = filterSchemesAdvanced(
    evaluations,
    { ...DEFAULT_ADVANCED_FILTERS, savedOnly: true },
    savedSchemeIds
  );
  assert.equal(savedOnlyFiltered.length, 2);
  assert.deepEqual(
    savedOnlyFiltered.map((e) => e.scheme.id).sort(),
    [...savedSchemeIds].sort()
  );
  assert.equal(countActiveAdvancedFilters({ ...DEFAULT_ADVANCED_FILTERS, savedOnly: true }), 1);
});

test('photoJawabHelper: Photo Bhejo Jawab Pao explains Ehde ch ki likheya aa and Agge ki karna aa for Ration Card, Bill, and Form', () => {
  assert.equal(detectPhotoJawabCategory({ fileName: 'my_ration_card.jpg' }), 'ration_card');
  assert.equal(detectPhotoJawabCategory({ fileName: 'pspcl_bijli_bill.png' }), 'electricity_bill');
  assert.equal(detectPhotoJawabCategory({ rawText: 'Sewa Kendra Application Form Box 1' }), 'application_form');

  const rationAnalysis = analyzePhotoJawabInput({
    fileName: 'Punjab_Ration_Card.jpg',
    language: 'pa',
  });
  assert.equal(rationAnalysis.category, 'ration_card');
  assert.ok(rationAnalysis.ehdeChKiLikheyaPa.length > 20);
  assert.ok(rationAnalysis.aggeKiKarnaPa.length >= 3);
  assert.ok(rationAnalysis.formattedReply.includes('Ehde ch ki likheya aa'));
  assert.ok(rationAnalysis.formattedReply.includes('Agge ki karna aa'));
  assert.ok(rationAnalysis.unlockedSchemeIds.includes('smart-ration-card'));

  const billAnalysis = analyzePhotoJawabInput({
    fileName: 'PSPCL_Electricity_Bill.jpg',
    language: 'en',
  });
  assert.equal(billAnalysis.category, 'electricity_bill');
  assert.ok(billAnalysis.ehdeChKiLikheyaEn.includes('3004819204'));
  assert.ok(billAnalysis.unlockedSchemeIds.includes('punjab-300-units-free-electricity'));
});

test('advancedSchemeFilter: segments schemes by Agriculture, Education, Women, and Seniors sectors accurately', () => {
  const sampleProfile: CitizenProfile = {
    username: '',
    age: 35,
    gender: 'Female',
    occupation: 'Farmer',
    annualIncome: 120000,
    category: 'SC',
    district: 'Ludhiana',
    isPunjabDomicile: true,
    landholdingAcres: 2.5,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: false,
  };

  const evaluations = evaluateAllSchemes(sampleProfile, GOV_SCHEMES);
  const sectorCounts = countSchemesBySectorCategory(GOV_SCHEMES);

  // Verify DASHBOARD_SECTOR_CATEGORIES includes Agriculture, Education, Women, and Seniors
  const sectorIds = DASHBOARD_SECTOR_CATEGORIES.map((s) => s.id);
  assert.ok(sectorIds.includes('Agriculture'));
  assert.ok(sectorIds.includes('Education'));
  assert.ok(sectorIds.includes('Women'));
  assert.ok(sectorIds.includes('Seniors'));

  for (const sector of ['Agriculture', 'Education', 'Women', 'Seniors']) {
    const filtered = filterSchemesAdvanced(evaluations, {
      ...DEFAULT_ADVANCED_FILTERS,
      category: sector,
    });
    assert.ok(filtered.length > 0, `Sector ${sector} must match at least 1 scheme`);
    assert.equal(filtered.length, sectorCounts[sector], `Sector ${sector} count must match filtered length`);
    assert.ok(
      filtered.every((item) => matchesCategoryFilter(item.scheme, sector)),
      `Every scheme in ${sector} filter must satisfy matchesCategoryFilter`
    );
  }

  // Verify Old Age Pension is matched by Seniors sector
  const oldAgePension = GOV_SCHEMES.find((s) => s.id === 'punjab-old-age-pension');
  assert.ok(oldAgePension, 'punjab-old-age-pension must exist');
  assert.equal(isSchemeForSeniors(oldAgePension), true);
  assert.equal(matchesCategoryFilter(oldAgePension, 'Seniors'), true);
});

test('schemeComparison: toggles multiple schemes up to MAX_COMPARISON_SCHEMES and builds side-by-side eligibility and benefit matrix', () => {
  let selectedIds: string[] = [];

  // Select 2 schemes
  const firstToggle = toggleSchemeInComparison(selectedIds, 'pm-kisan', MAX_COMPARISON_SCHEMES);
  assert.equal(firstToggle.added, true);
  assert.equal(firstToggle.limitReached, false);
  selectedIds = firstToggle.nextIds;

  const secondToggle = toggleSchemeInComparison(selectedIds, 'punjab-old-age-pension', MAX_COMPARISON_SCHEMES);
  assert.equal(secondToggle.added, true);
  selectedIds = secondToggle.nextIds;
  assert.deepEqual(selectedIds, ['pm-kisan', 'punjab-old-age-pension']);

  // Build side-by-side comparison matrix
  const sampleProfile: CitizenProfile = {
    username: '',
    age: 66,
    gender: 'Male',
    occupation: 'Farmer',
    annualIncome: 50000,
    category: 'SC',
    district: 'Ludhiana',
    isPunjabDomicile: true,
    landholdingAcres: 2.0,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: false,
  };
  const evaluations = evaluateAllSchemes(sampleProfile, GOV_SCHEMES);
  const evaluationMap = new Map(evaluations.map((e) => [e.schemeId, e]));

  const selectedSchemes = selectedIds
    .map((id) => GOV_SCHEMES.find((s) => s.id === id)!)
    .filter(Boolean);

  const matrix = buildSchemeComparisonMatrix(selectedSchemes, evaluationMap, 'en');
  assert.equal(matrix.length, 2);
  assert.equal(matrix[0].scheme.id, 'pm-kisan');
  assert.equal(matrix[1].scheme.id, 'punjab-old-age-pension');

  // Verify benefit amounts and formatted eligibility criteria exist side-by-side
  assert.ok(matrix[0].benefitAmountText.includes('6,000'));
  assert.ok(matrix[1].benefitAmountText.includes('1,500'));
  assert.ok(matrix[0].ageRequirementText.length > 0);
  assert.ok(matrix[1].ageRequirementText.includes('58'));
  assert.ok(matrix[1].incomeRequirementText.includes('60,000'));
  assert.equal(matrix[0].isEligible, true);
  assert.equal(matrix[1].isEligible, true);

  // Removing a scheme via toggle
  const removeFirst = toggleSchemeInComparison(selectedIds, 'pm-kisan', MAX_COMPARISON_SCHEMES);
  assert.equal(removeFirst.added, false);
  assert.deepEqual(removeFirst.nextIds, ['punjab-old-age-pension']);
});

test('advancedSchemeFilter: sorts schemes accurately by Newest, Popularity, and Benefit Amount', () => {
  const sampleProfile: CitizenProfile = {
    username: 'Harpreet',
    phoneNumber: '9876543210',
    age: 22,
    gender: 'Female',
    occupation: 'Student',
    annualIncome: 110000,
    category: 'SC',
    district: 'Ludhiana',
    isPunjabDomicile: true,
    landholdingAcres: 0,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: true,
  };

  const evaluations = evaluateAllSchemes(sampleProfile, GOV_SCHEMES);

  // 1. Benefit Amount sorting: highest numeric benefit amount must come first
  const byBenefit = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    sortBy: 'benefit_amount',
  });
  assert.ok(byBenefit.length >= 3);
  for (let i = 0; i < byBenefit.length - 1; i++) {
    const currentAmt = extractNumericBenefitAmount(byBenefit[i].scheme);
    const nextAmt = extractNumericBenefitAmount(byBenefit[i + 1].scheme);
    assert.ok(
      currentAmt >= nextAmt,
      `Expected benefit amount ${currentAmt} (${byBenefit[i].scheme.id}) >= ${nextAmt} (${byBenefit[i + 1].scheme.id})`
    );
  }

  // 2. Popularity sorting: higher popularity score must come first
  const savedIds = ['pm-kisan'];
  const byPopularity = filterSchemesAdvanced(
    evaluations,
    {
      ...DEFAULT_ADVANCED_FILTERS,
      sortBy: 'popularity',
    },
    savedIds
  );
  assert.ok(byPopularity.length >= 3);
  for (let i = 0; i < byPopularity.length - 1; i++) {
    const currentPop = computeSchemePopularityScore(byPopularity[i].scheme, byPopularity[i], savedIds);
    const nextPop = computeSchemePopularityScore(byPopularity[i + 1].scheme, byPopularity[i + 1], savedIds);
    assert.ok(currentPop >= nextPop, `Expected popularity ${currentPop} >= ${nextPop}`);
  }

  // 3. Newest sorting: higher newest rank must come first
  const byNewest = sortSchemeEvaluations(evaluations, 'newest');
  assert.ok(byNewest.length >= 3);
  for (let i = 0; i < byNewest.length - 1; i++) {
    const currentRank = computeSchemeNewestRank(byNewest[i].scheme);
    const nextRank = computeSchemeNewestRank(byNewest[i + 1].scheme);
    assert.ok(currentRank >= nextRank, `Expected newest rank ${currentRank} >= ${nextRank}`);
  }
});

test('phoneAlertService: dispatchAiProfileActivitySms automatically sends SMS to user profile phone on new scheme or website work completion', async () => {
  const pmKisan = GOV_SCHEMES.find((s) => s.id === 'pm-kisan')!;

  const workSms = await dispatchAiProfileActivitySms({
    phoneNumber: '9876543210',
    activityType: 'profile_saved',
    language: 'pa',
    workSummaryPa: 'ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ ਸੇਵ ਹੋ ਗਈ ਹੈ।',
  });
  assert.equal(workSms.ok, true, 'Work completion SMS must succeed for valid profile phone number');
  assert.ok(workSms.message, 'Work completion SMS message payload must be present');
  assert.equal(workSms.message.phoneNumber, '9876543210');
  assert.ok(workSms.message.smsBody.includes('ਤੁਹਾਡਾ ਕੰਮ ਹੋ ਗਿਆ'));

  const newSchemeSms = await dispatchAiProfileActivitySms({
    phoneNumber: '+91 9876543210',
    activityType: 'new_scheme',
    language: 'pa',
    scheme: pmKisan,
  });
  assert.equal(newSchemeSms.ok, true, 'New scheme SMS must succeed for valid profile phone number');
  assert.ok(newSchemeSms.message, 'New scheme SMS message payload must be present');
  assert.ok(newSchemeSms.message.smsBody.includes('ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਨਵੀਂ ਸਕੀਮ ਆਈ ਆ'));
});

test('schemeNotifications: generates approaching deadline alerts for saved schemes and status change alerts with unread/read tracking', () => {
  const refDate = new Date('2026-11-20T00:00:00Z');
  const savedIds = ['pm-kisan', 'post-matric-obc'];

  const deadlineNotifs = buildSavedSchemeDeadlineNotifications(
    GOV_SCHEMES,
    savedIds,
    refDate,
    30
  );
  assert.equal(deadlineNotifs.length, 2);
  assert.equal(deadlineNotifs[0].schemeId, 'pm-kisan');
  assert.equal(deadlineNotifs[0].type, 'deadline_approaching');
  assert.equal(deadlineNotifs[0].daysRemaining, 0);
  assert.equal(deadlineNotifs[0].urgency, 'critical');

  const statusNotif = createStatusChangeNotification({
    id: 'test-status-1',
    schemeId: 'pm-kisan',
    schemeTitleEn: 'PM-Kisan Samman Nidhi Yojana',
    benefitAmountText: '₹6,000 / year',
    previousStatus: 'Form Submitted',
    newStatus: 'Approved',
  });
  assert.equal(statusNotif.type, 'status_change');
  assert.equal(statusNotif.urgency, 'success');
  assert.ok(statusNotif.titleEn.includes('Approved'));

  const merged = mergeAndSortNotifications(deadlineNotifs, [statusNotif], [], []);
  const stats = countUnreadNotifications(merged);
  assert.equal(stats.total, 3);
  assert.equal(stats.unread, 3);
  assert.equal(stats.deadlineCount, 2);
  assert.equal(stats.statusChangeCount, 1);

  // Mark one as read and dismiss one
  const afterReadAndDismiss = mergeAndSortNotifications(
    deadlineNotifs,
    [statusNotif],
    ['test-status-1'],
    [deadlineNotifs[1].id]
  );
  const updatedStats = countUnreadNotifications(afterReadAndDismiss);
  assert.equal(updatedStats.total, 2);
  assert.equal(updatedStats.unread, 1);
});

