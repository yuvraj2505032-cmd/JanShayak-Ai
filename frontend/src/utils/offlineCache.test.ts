import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateOfflineChatReply,
  generateOfflineSchemeAdvice,
  generateOfflineProfileRoadmap,
} from './offlineCache';
import { GOV_SCHEMES } from '../data/schemes';
import type { CitizenProfile } from '../types/scheme';

const TEST_PROFILE: CitizenProfile = {
  username: 'Gurpreet',
  role: 'Citizen',
  age: 20,
  gender: 'Male',
  occupation: 'Student',
  annualIncome: 120000,
  category: 'SC',
  district: 'Ludhiana',
  isPunjabDomicile: true,
  landholdingAcres: 0,
  hasDisability: false,
  isEnrolledInSchoolOrCollege: true,
  isWidowOrDestitute: false,
};

test('generateOfflineChatReply returns relevant student scholarship schemes offline', () => {
  const res = generateOfflineChatReply('scholarship for sc student', 'en-IN', TEST_PROFILE, GOV_SCHEMES);
  assert.ok(res.reply.includes('Offline Mode'));
  assert.ok(res.recommendedSchemeIds.length > 0);
  assert.equal(res.isAiGrounded, true);
});

test('generateOfflineChatReply supports Punjabi queries offline', () => {
  const res = generateOfflineChatReply('ਮੈਂ ਕਿਸਾਨ ਹਾਂ', 'pa-IN', TEST_PROFILE, GOV_SCHEMES);
  assert.ok(res.reply.includes('ਆਫ਼ਲਾਈਨ ਮੋਡ'));
  assert.ok(res.recommendedSchemeIds.includes('pm-kisan'));
});

test('generateOfflineSchemeAdvice generates structured offline advice in English and Punjabi', () => {
  const scheme = GOV_SCHEMES[0];
  const enAdvice = generateOfflineSchemeAdvice(scheme, TEST_PROFILE, 'en');
  assert.ok(enAdvice.includes('Offline AI Eligibility Evaluation'));
  assert.ok(enAdvice.includes(scheme.titleEn));

  const paAdvice = generateOfflineSchemeAdvice(scheme, TEST_PROFILE, 'pa');
  assert.ok(paAdvice.includes('ਆਫ਼ਲਾਈਨ AI ਮੁਲਾਂਕਣ'));
});

test('generateOfflineProfileRoadmap generates offline welfare roadmap for profile', () => {
  const roadmap = generateOfflineProfileRoadmap(TEST_PROFILE, GOV_SCHEMES, 'en');
  assert.ok(roadmap.includes('Offline Citizen Welfare Roadmap'));
  assert.ok(roadmap.includes('Ludhiana'));
});

import {
  INDIA_STATES_AND_UTS,
  getDistrictsForState,
  ALL_STATES_SCHEMES_POOL,
  generateAutonomousAiSchemeBundle,
} from '../data/indiaStatesAndDistricts';
import { filterSchemesAdvanced, DEFAULT_ADVANCED_FILTERS } from './advancedSchemeFilter';
import { evaluateAllSchemes } from './schemeEngine';

test('INDIA_STATES_AND_UTS contains all 36 Indian States and Union Territories with 700+ districts', () => {
  assert.equal(INDIA_STATES_AND_UTS.length, 36);
  const totalDistricts = INDIA_STATES_AND_UTS.reduce((sum, s) => sum + s.districts.length, 0);
  assert.ok(totalDistricts >= 700, `Expected at least 700 districts across India, got ${totalDistricts}`);
  const haryanaDistricts = getDistrictsForState('Haryana');
  assert.ok(haryanaDistricts.some((d) => d.name === 'Karnal'));
  const maharashtraDistricts = getDistrictsForState('Maharashtra');
  assert.ok(maharashtraDistricts.some((d) => d.name === 'Pune'));
});

test('ALL_STATES_SCHEMES_POOL provides verified flagship schemes across Indian States and UTs', () => {
  assert.ok(ALL_STATES_SCHEMES_POOL.length >= 30);
  for (const item of ALL_STATES_SCHEMES_POOL) {
    assert.ok(item.scheme.id.length > 0);
    assert.ok(item.scheme.officialPortalUrl.startsWith('https://'));
    assert.ok(item.portal.url.startsWith('https://'));
  }
});

test('generateAutonomousAiSchemeBundle continuously synthesizes unique new State schemes for AI Admin', () => {
  const existingIds = new Set<string>(GOV_SCHEMES.map((s) => s.id));
  const first = generateAutonomousAiSchemeBundle(existingIds, 0);
  assert.ok(!existingIds.has(first.scheme.id));
  existingIds.add(first.scheme.id);

  const second = generateAutonomousAiSchemeBundle(existingIds, 1);
  assert.notEqual(second.scheme.id, first.scheme.id);
  assert.ok(second.scheme.state && second.scheme.state.length > 0);
});

test('filterSchemesAdvanced filters schemes accurately by specific Indian State', () => {
  const combinedSchemes = [...GOV_SCHEMES, ...ALL_STATES_SCHEMES_POOL.map((i) => i.scheme)];
  const evaluations = evaluateAllSchemes(TEST_PROFILE, combinedSchemes);
  const haryanaFiltered = filterSchemesAdvanced(evaluations, {
    ...DEFAULT_ADVANCED_FILTERS,
    level: 'Haryana',
  });
  assert.ok(haryanaFiltered.length > 0);
  assert.ok(haryanaFiltered.every((e) => e.scheme.state === 'Haryana' || e.scheme.level.includes('Haryana')));
});


