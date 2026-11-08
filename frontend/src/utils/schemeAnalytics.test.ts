import test from 'node:test';
import assert from 'node:assert/strict';
import { computeAnalyticsSummary, classifySchemeCategoryKey } from './schemeAnalytics';
import { GOV_SCHEMES } from '../data/schemes';
import { ALL_STATES_SCHEMES_POOL } from '../data/indiaStatesAndDistricts';
import { evaluateAllSchemes } from './schemeEngine';
import type { CitizenProfile } from '../types/scheme';

const STUDENT_PROFILE: CitizenProfile = {
  username: 'Simran',
  role: 'Citizen',
  age: 20,
  gender: 'Female',
  occupation: 'Student',
  annualIncome: 120000,
  category: 'SC',
  district: 'Ludhiana',
  state: 'Punjab',
  isPunjabDomicile: true,
  landholdingAcres: 0,
  hasDisability: false,
  isEnrolledInSchoolOrCollege: true,
  isWidowOrDestitute: false,
};

const FARMER_PROFILE: CitizenProfile = {
  ...STUDENT_PROFILE,
  age: 42,
  occupation: 'Farmer',
  landholdingAcres: 3.5,
  isEnrolledInSchoolOrCollege: false,
};

test('classifySchemeCategoryKey classifies student, farmer, and health schemes into distinct categories', () => {
  const pmKisan = GOV_SCHEMES.find((s) => s.id === 'pm-kisan')!;
  assert.equal(classifySchemeCategoryKey(pmKisan), 'Agriculture');

  const postMatric = GOV_SCHEMES.find((s) => s.titleEn.toLowerCase().includes('scholarship'))!;
  assert.equal(classifySchemeCategoryKey(postMatric), 'Education');

  const sehatBima = GOV_SCHEMES.find((s) => s.id === 'sarbat-sehat-bima')!;
  assert.equal(classifySchemeCategoryKey(sehatBima), 'Health');
});

test('computeAnalyticsSummary aggregates category distribution and eligibility counts accurately for current profile', () => {
  const allSchemes = [...GOV_SCHEMES, ...ALL_STATES_SCHEMES_POOL.map((i) => i.scheme)];
  const studentEvals = evaluateAllSchemes(STUDENT_PROFILE, allSchemes);
  const summary = computeAnalyticsSummary(allSchemes, studentEvals);

  assert.equal(summary.totalSchemes, allSchemes.length);
  assert.equal(
    summary.eligibleCount + summary.potentialCount + summary.ineligibleCount,
    summary.totalSchemes
  );

  // Sum of category totalCounts must equal totalSchemes
  const sumCategoryTotals = summary.categoryDistribution.reduce((acc, row) => acc + row.totalCount, 0);
  assert.equal(sumCategoryTotals, summary.totalSchemes);

  // Sum of category eligibleCounts must equal eligibleCount
  const sumCategoryEligible = summary.categoryDistribution.reduce(
    (acc, row) => acc + row.eligibleCount,
    0
  );
  assert.equal(sumCategoryEligible, summary.eligibleCount);
  assert.ok(summary.eligibleCount > 0);
});

test('computeAnalyticsSummary updates eligibility counts dynamically when user profile changes from Student to Farmer', () => {
  const studentEvals = evaluateAllSchemes(STUDENT_PROFILE, GOV_SCHEMES);
  const farmerEvals = evaluateAllSchemes(FARMER_PROFILE, GOV_SCHEMES);

  const studentSummary = computeAnalyticsSummary(GOV_SCHEMES, studentEvals);
  const farmerSummary = computeAnalyticsSummary(GOV_SCHEMES, farmerEvals);

  const studentEdu = studentSummary.categoryDistribution.find((c) => c.key === 'Education')!;
  const farmerEdu = farmerSummary.categoryDistribution.find((c) => c.key === 'Education')!;
  assert.ok(studentEdu.eligibleCount > farmerEdu.eligibleCount);

  const studentAgri = studentSummary.categoryDistribution.find((c) => c.key === 'Agriculture')!;
  const farmerAgri = farmerSummary.categoryDistribution.find((c) => c.key === 'Agriculture')!;
  assert.ok(farmerAgri.eligibleCount > studentAgri.eligibleCount);
});
