import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCanonicalDocKey,
  isDocumentOwned,
  scanAndAnalyzeDocumentInput,
  detectMissingDocumentsReport,
  getDocumentMeta,
} from './documentHelper';
import { GOV_SCHEMES } from '../data/schemes';
import { evaluateAllSchemes } from './schemeEngine';
import { CitizenProfile } from '../types/scheme';

const TEST_STUDENT_PROFILE: CitizenProfile = {
  username: 'TestStudent',
  role: 'Citizen',
  age: 20,
  gender: 'Female',
  occupation: 'Student',
  annualIncome: 110000,
  category: 'SC',
  district: 'Ludhiana',
  state: 'Punjab',
  isPunjabDomicile: true,
  landholdingAcres: 0,
  hasDisability: false,
  isWidowOrDestitute: false,
  isEnrolledInSchoolOrCollege: true,
};

test('normalizeCanonicalDocKey maps diverse government document names to canonical keys', () => {
  assert.equal(normalizeCanonicalDocKey('Aadhaar Card linked with Mobile'), 'aadhaar_card');
  assert.equal(normalizeCanonicalDocKey('Applicant Aadhaar Card (UIDAI)'), 'aadhaar_card');
  assert.equal(normalizeCanonicalDocKey('Annual Income Certificate (Issued by Tehsildar/SDM)'), 'income_certificate');
  assert.equal(normalizeCanonicalDocKey('Family Income Certificate'), 'income_certificate');
  assert.equal(normalizeCanonicalDocKey('Punjab Residence / Domicile Certificate'), 'domicile_certificate');
  assert.equal(normalizeCanonicalDocKey('SC / ST / BC Caste Certificate'), 'caste_certificate');
  assert.equal(normalizeCanonicalDocKey('Active Bank Passbook (NPCI mapped)'), 'bank_passbook');
  assert.equal(normalizeCanonicalDocKey('Land Ownership Records (Fard / Jamabandi)'), 'land_record');
});

test('isDocumentOwned matches both exact and semantically equivalent documents', () => {
  const wallet = new Set<string>(['aadhaar card linked with mobile', 'annual income certificate (issued by tehsildar/sdm)']);
  assert.equal(isDocumentOwned('Aadhaar Card', wallet), true);
  assert.equal(isDocumentOwned('Applicant Aadhaar Card (UIDAI)', wallet), true);
  assert.equal(isDocumentOwned('Income Certificate (Tehsildar)', wallet), true);
  assert.equal(isDocumentOwned('SC / ST / BC Caste Certificate', wallet), false);
});

test('scanAndAnalyzeDocumentInput extracts certificate metadata and checks validity advisories', () => {
  const aadhaarScan = scanAndAnalyzeDocumentInput({
    fileName: 'citizen_aadhaar_card.pdf',
    rawText: 'UIDAI Govt of India Aadhaar No: 4512 8890 3412 Mobile Linked',
  });
  assert.equal(aadhaarScan.canonicalKey, 'aadhaar_card');
  assert.equal(aadhaarScan.extractedIdNumber, 'XXXX-XXXX-3412');
  assert.equal(aadhaarScan.validityStatus, 'Valid & Verified');
  assert.ok(aadhaarScan.confidenceScore >= 90);

  const expiredIncomeScan = scanAndAnalyzeDocumentInput({
    fileName: 'old_income_certificate.jpg',
    rawText: 'Punjab Revenue Dept Income Certificate PB-INC-2020-55112 Issued in 2020',
  });
  assert.equal(expiredIncomeScan.canonicalKey, 'income_certificate');
  assert.equal(expiredIncomeScan.extractedIdNumber, 'PB-INC-2020-55112');
  assert.equal(expiredIncomeScan.validityStatus, 'Action Needed: Seeding / Validity Check');
});

test('detectMissingDocumentsReport calculates target scheme readiness and high-impact missing documents', () => {
  const evaluations = evaluateAllSchemes(TEST_STUDENT_PROFILE, GOV_SCHEMES);
  const owned = new Set<string>(['aadhaar card linked with mobile']);

  const report = detectMissingDocumentsReport(
    GOV_SCHEMES,
    evaluations,
    owned,
    'post-matric-sc'
  );

  assert.equal(report.targetScheme.schemeId, 'post-matric-sc');
  assert.ok(report.targetScheme.totalDocs >= 3);
  assert.ok(report.targetScheme.verifiedCount >= 1);
  assert.ok(report.targetScheme.missingCount >= 1);
  assert.ok(report.profileWide.highImpactMissingDocs.length > 0);
  // High-impact missing docs should be sorted descending by unlockedSchemesCount
  const counts = report.profileWide.highImpactMissingDocs.map((d) => d.unlockedSchemesCount);
  for (let i = 1; i < counts.length; i++) {
    assert.ok(counts[i - 1] >= counts[i]);
  }
});

test('getDocumentMeta provides actionable portal links and turnaround estimates', () => {
  const meta = getDocumentMeta('Punjab Residence / Domicile Certificate');
  assert.equal(meta.canonicalKey, 'domicile_certificate');
  assert.equal(meta.isMandatory, true);
  assert.ok(meta.officialPortalUrl.includes('punjab.gov.in'));
  assert.ok(meta.howToObtainEn.length > 10);
});
