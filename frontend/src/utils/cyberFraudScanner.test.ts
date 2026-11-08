import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeWebsiteAndCyberThreat,
  buildDynamicEligibilityPreset,
  resolveLocationFromInputOrCoords,
} from './cyberFraudScanner';
import { CitizenProfile } from '../types/scheme';

const baseProfile: CitizenProfile = {
  username: 'Gurpreet',
  role: 'Citizen',
  age: 30,
  gender: 'Male',
  state: 'Punjab',
  district: 'Ludhiana',
  annualIncome: 150000,
  category: 'General',
  occupation: 'Farmer',
  isPunjabDomicile: true,
  hasDisability: false,
  isWidowOrDestitute: false,
  landholdingAcres: 2,
  isEnrolledInSchoolOrCollege: false,
};

test('analyzeWebsiteAndCyberThreat returns Low Risk Level for official .gov.in and .nic.in HTTPS websites', () => {
  const result = analyzeWebsiteAndCyberThreat('https://pmkisan.gov.in/RegistrationForm.aspx', 'backend-deep-analyzer');
  assert.equal(result.verdict, 'REAL_OFFICIAL_GOV');
  assert.equal(result.riskLevel, 'SAFE');
  assert.equal(result.riskLevelScore, 'Low');
  assert.equal(result.deepAnalysis.riskLevelScore, 'Low');
  assert.equal(result.deepAnalysis.checks.httpsCheck.passed, true);
  assert.equal(result.deepAnalysis.checks.govDomainCheck.passed, true);
  assert.equal(result.deepAnalysis.checks.phishingSignatureCheck.passed, true);
  assert.equal(result.websiteIntel.isOfficialGovDomain, true);
  assert.equal(result.websiteIntel.sslEncrypted, true);
  assert.ok(result.trustScore >= 90);
  assert.ok(result.riskScore <= 10);
});

test('analyzeWebsiteAndCyberThreat returns Medium Risk Level for unverified non-.gov.in HTTPS domains or HTTP .gov.in URLs', () => {
  const nonGovBlog = analyzeWebsiteAndCyberThreat('https://indian-citizen-news-portal.org/scheme-updates', 'backend-deep-analyzer');
  assert.equal(nonGovBlog.verdict, 'UNVERIFIED_CAUTION');
  assert.equal(nonGovBlog.riskLevelScore, 'Medium');
  assert.equal(nonGovBlog.deepAnalysis.checks.httpsCheck.passed, true);
  assert.equal(nonGovBlog.deepAnalysis.checks.govDomainCheck.passed, false);
  assert.equal(nonGovBlog.deepAnalysis.checks.phishingSignatureCheck.passed, true);

  const httpGov = analyzeWebsiteAndCyberThreat('http://punjab.gov.in/schemes', 'backend-deep-analyzer');
  assert.equal(httpGov.riskLevelScore, 'Medium');
  assert.equal(httpGov.deepAnalysis.checks.httpsCheck.passed, false);
  assert.equal(httpGov.deepAnalysis.checks.govDomainCheck.passed, true);
});

test('analyzeWebsiteAndCyberThreat returns High Risk Level for fake phishing portals, lack of HTTPS on non-gov, and brand spoofing', () => {
  const result = analyzeWebsiteAndCyberThreat(
    'http://pmkisan-free-bonus-claim.xyz/login?otp=1234 Urgent! Pay ₹299 processing fee via UPI PIN to unlock ₹50,000.',
    'backend-deep-analyzer'
  );
  assert.equal(result.verdict, 'FAKE_PHISHING_SCAM');
  assert.equal(result.riskLevel, 'CRITICAL');
  assert.equal(result.riskLevelScore, 'High');
  assert.equal(result.deepAnalysis.checks.httpsCheck.passed, false);
  assert.equal(result.deepAnalysis.checks.govDomainCheck.passed, false);
  assert.equal(result.deepAnalysis.checks.phishingSignatureCheck.passed, false);
  assert.equal(result.deepAnalysis.checks.brandSpoofingCheck.passed, false);
  assert.equal(result.websiteIntel.isOfficialGovDomain, false);
  assert.ok(result.trustScore <= 25);
  assert.ok(result.riskScore >= 75);
  assert.ok(result.websiteIntel.recommendedOfficialPortal.includes('.gov.in'));
});

test('analyzeWebsiteAndCyberThreat returns High Risk Level and blocks hacker SQLi, XSS, and malicious APK payloads', () => {
  const sqliResult = analyzeWebsiteAndCyberThreat(
    "https://fake-portal.xyz/search?q=1' UNION SELECT username, password FROM users-- <script>alert(1)</script> download pmkisan_kyc.apk",
    'backend-deep-analyzer'
  );
  assert.equal(sqliResult.verdict, 'HACKER_MALICIOUS_BLOCKED');
  assert.equal(sqliResult.riskLevel, 'CRITICAL');
  assert.equal(sqliResult.riskLevelScore, 'High');
  assert.equal(sqliResult.riskScore, 100);
  assert.equal(sqliResult.isBlockedByShield, true);
  assert.equal(sqliResult.deepAnalysis.checks.exploitPayloadCheck.passed, false);
  assert.ok(sqliResult.detectedAttackVectors.length >= 2);
});

test('buildDynamicEligibilityPreset builds tailored profile patch and criteria pills for Student, Farmer, and Senior Citizen', () => {
  const studentPreset = buildDynamicEligibilityPreset('Student', baseProfile);
  assert.equal(studentPreset.profilePatch.occupation, 'Student');
  assert.equal(studentPreset.profilePatch.isEnrolledInSchoolOrCollege, true);
  assert.equal(studentPreset.profilePatch.landholdingAcres, 0);
  assert.ok(studentPreset.criteriaPills.length >= 4);

  const farmerPreset = buildDynamicEligibilityPreset('Farmer', {
    ...baseProfile,
    occupation: 'Student',
    landholdingAcres: 0,
  });
  assert.equal(farmerPreset.profilePatch.occupation, 'Farmer');
  assert.equal(farmerPreset.profilePatch.isEnrolledInSchoolOrCollege, false);
  assert.ok((farmerPreset.profilePatch.landholdingAcres ?? 0) > 0);

  const seniorPreset = buildDynamicEligibilityPreset('Senior Citizen', baseProfile);
  assert.equal(seniorPreset.profilePatch.occupation, 'Senior Citizen');
  assert.ok((seniorPreset.profilePatch.age ?? 0) >= 60);
});

test('resolveLocationFromInputOrCoords resolves district names, pincodes, and GPS coordinates', () => {
  const patialaMatch = resolveLocationFromInputOrCoords({
    rawLocationText: 'Village Samana, Patiala, 147001',
    currentState: 'Punjab',
    currentDistrict: 'Ludhiana',
  });
  assert.equal(patialaMatch.state, 'Punjab');
  assert.equal(patialaMatch.district, 'Patiala');
  assert.equal(patialaMatch.pincode, '147001');
  assert.ok(patialaMatch.customLocation.includes('Samana'));

  const pincodeMatch = resolveLocationFromInputOrCoords({
    rawLocationText: 'Area 411001',
    currentState: 'Punjab',
    currentDistrict: 'Ludhiana',
  });
  assert.equal(pincodeMatch.state, 'Maharashtra');
  assert.equal(pincodeMatch.pincode, '411001');

  const gpsMatch = resolveLocationFromInputOrCoords({
    latitude: 30.901,
    longitude: 75.8573,
    currentState: 'Delhi',
    currentDistrict: 'New Delhi',
  });
  assert.equal(gpsMatch.state, 'Punjab');
  assert.equal(gpsMatch.district, 'Ludhiana');
});
