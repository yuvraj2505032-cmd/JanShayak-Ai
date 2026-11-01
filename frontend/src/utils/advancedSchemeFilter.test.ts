import test from 'node:test';
import assert from 'node:assert/strict';
import { GOV_SCHEMES } from '../data/schemes';
import { evaluateAllSchemes } from './schemeEngine';
import { CitizenProfile } from '../types/scheme';
import {
  DEFAULT_ADVANCED_FILTERS,
  filterSchemesAdvanced,
  countActiveAdvancedFilters,
  getSmartSearchSuggestions,
  recordRecentlyViewedScheme,
  getTopRecommendedSchemes,
  isSchemeForWomen,
  isSchemeForStudents,
  isSchemeForFarmers,
  isSchemeForBusiness,
} from './advancedSchemeFilter';

const sampleCitizen: CitizenProfile = {
  username: 'Simran',
  role: 'Citizen',
  age: 21,
  gender: 'Female',
  occupation: 'Student',
  annualIncome: 95000,
  category: 'SC',
  district: 'Ludhiana',
  isPunjabDomicile: true,
  landholdingAcres: 0,
  hasDisability: false,
  isWidowOrDestitute: false,
  isEnrolledInSchoolOrCollege: true,
};

const evaluations = evaluateAllSchemes(sampleCitizen, GOV_SCHEMES);

test('filterSchemesAdvanced returns all schemes when default filters are active', () => {
  const result = filterSchemesAdvanced(evaluations, DEFAULT_ADVANCED_FILTERS, []);
  assert.equal(result.length, evaluations.length);
  assert.equal(countActiveAdvancedFilters(DEFAULT_ADVANCED_FILTERS), 0);
});

test('filterSchemesAdvanced filters accurately by Women, Students, Farmers, and Business target groups', () => {
  const womenResults = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    targetGroup: 'women',
  });
  assert.ok(womenResults.length > 0, 'Should return women-focused schemes');
  assert.ok(womenResults.every((e) => isSchemeForWomen(e.scheme)));

  const studentResults = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    targetGroup: 'students',
  });
  assert.ok(studentResults.length > 0, 'Should return student-focused schemes');
  assert.ok(studentResults.every((e) => isSchemeForStudents(e.scheme)));

  const farmerResults = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    targetGroup: 'farmers',
  });
  assert.ok(farmerResults.length > 0, 'Should return farmer-focused schemes');
  assert.ok(farmerResults.every((e) => isSchemeForFarmers(e.scheme)));

  const businessResults = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    targetGroup: 'business',
  });
  assert.ok(businessResults.length > 0, 'Should return business/self-employed schemes');
  assert.ok(businessResults.every((e) => isSchemeForBusiness(e.scheme)));
});

test('filterSchemesAdvanced filters by State/Level, Age Bracket, Income, and Education Level', () => {
  const punjabOnly = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    level: 'Punjab State',
  });
  assert.ok(punjabOnly.length > 0);
  assert.ok(punjabOnly.every((e) => e.scheme.level === 'Punjab State'));

  const seniorOnly = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    ageBracket: '60plus',
  });
  assert.ok(seniorOnly.length > 0);

  const highIncome = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    maxIncome: 300000,
  });
  assert.ok(
    highIncome.every(
      (e) => typeof e.scheme.maxIncome !== 'number' || e.scheme.maxIncome >= 300000
    )
  );

  const enrolledEducation = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    educationLevel: 'enrolled',
  });
  assert.ok(enrolledEducation.length > 0);
});

test('filterSchemesAdvanced handles natural language queries accurately', () => {
  const nlQuery = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    query: 'What scholarship can a college student get in Punjab?',
  });
  assert.ok(nlQuery.length > 0, 'Should match scholarship schemes for natural language question');

  const marriageQuery = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    query: 'daughter marriage shagun ashirwad',
  });
  assert.ok(marriageQuery.some((e) => e.scheme.id === 'punjab-ashirwad'));
});

test('recordRecentlyViewedScheme deduplicates and caps history length', () => {
  let history: string[] = [];
  history = recordRecentlyViewedScheme(history, 'pm-kisan', 3);
  history = recordRecentlyViewedScheme(history, 'post-matric-sc', 3);
  history = recordRecentlyViewedScheme(history, 'pm-kisan', 3); // move to front
  assert.deepEqual(history, ['pm-kisan', 'post-matric-sc']);

  history = recordRecentlyViewedScheme(history, 'punjab-ashirwad', 3);
  history = recordRecentlyViewedScheme(history, 'sarbat-sehat-bima', 3);
  assert.equal(history.length, 3);
  assert.equal(history[0], 'sarbat-sehat-bima');
});

test('getTopRecommendedSchemes prioritizes eligible schemes with highest matchPercentage', () => {
  const top = getTopRecommendedSchemes(evaluations, 3);
  assert.equal(top.length, 3);
  assert.equal(top[0].isEligible, true);
  assert.ok(top[0].matchPercentage >= top[1].matchPercentage);
});

test('getSmartSearchSuggestions returns localized suggestions', () => {
  const enSuggestions = getSmartSearchSuggestions('', 'en');
  const paSuggestions = getSmartSearchSuggestions('', 'pa');
  const hiSuggestions = getSmartSearchSuggestions('', 'hi');
  assert.ok(enSuggestions.length >= 4);
  assert.ok(paSuggestions.length >= 4);
  assert.ok(hiSuggestions.length >= 4);
});

test('filterSchemesAdvanced filters by New vs Purani (Classic) vs AI Auto-Added scheme eras', () => {
  const newEraResults = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    schemeEra: 'new',
  });
  const puraniEraResults = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    schemeEra: 'purani',
  });
  assert.ok(newEraResults.length > 0, 'Should return New (2025-2026) schemes');
  assert.ok(puraniEraResults.length > 0, 'Should return Purani / Classic schemes');
  assert.equal(newEraResults.length + puraniEraResults.length, evaluations.length);
});

