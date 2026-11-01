import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSchemeBenefit, getDefaultEstimatorInputs } from './benefitEstimator.ts';
import { GOV_SCHEMES } from '../data/schemes.ts';

test('calculateSchemeBenefit scales PM-Kisan benefit with crop acreage and duration years', () => {
  const pmKisan = GOV_SCHEMES.find((s) => s.id === 'pm-kisan')!;
  assert.ok(pmKisan, 'pm-kisan scheme should exist');

  const estimate1Acre = calculateSchemeBenefit(pmKisan, {
    familySize: 4,
    cropAcreage: 1,
    durationYears: 1,
  });
  const estimate5Acres = calculateSchemeBenefit(pmKisan, {
    familySize: 4,
    cropAcreage: 5,
    durationYears: 2,
  });

  assert.equal(estimate1Acre.annualBenefit, 6000 + 1200);
  assert.equal(estimate5Acres.annualBenefit, 6000 + 5 * 1200);
  assert.equal(estimate5Acres.totalProjectedBenefit, (6000 + 5 * 1200) * 2);
  assert.ok(estimate5Acres.relevantFields.includes('cropAcreage'));
});

test('calculateSchemeBenefit scales Punjab Smart Ration Card benefit with family size', () => {
  const rationScheme = GOV_SCHEMES.find((s) => s.id === 'punjab-smart-ration-card')!;
  assert.ok(rationScheme, 'punjab-smart-ration-card should exist');

  const smallFamily = calculateSchemeBenefit(rationScheme, {
    familySize: 2,
    durationYears: 1,
  });
  const largeFamily = calculateSchemeBenefit(rationScheme, {
    familySize: 6,
    durationYears: 1,
  });

  assert.equal(largeFamily.annualBenefit, smallFamily.annualBenefit * 3);
  assert.ok(largeFamily.relevantFields.includes('familySize'));
});

test('calculateSchemeBenefit computes Post-Matric SC Scholarship with tuition fee and students count', () => {
  const scScholarship = GOV_SCHEMES.find((s) => s.id === 'post-matric-sc')!;
  assert.ok(scScholarship, 'post-matric-sc should exist');

  const result = calculateSchemeBenefit(scScholarship, {
    familySize: 4,
    eligibleMembersInFamily: 2,
    annualTuitionFee: 50000,
    durationYears: 3,
  });

  // (50,000 + 13,500) * 2 students = 127,000/yr
  assert.equal(result.annualBenefit, 127000);
  assert.equal(result.totalProjectedBenefit, 127000 * 3);
});

test('getDefaultEstimatorInputs returns sensible defaults from citizen profile', () => {
  const pmKisan = GOV_SCHEMES.find((s) => s.id === 'pm-kisan')!;
  const defaults = getDefaultEstimatorInputs(pmKisan, {
    username: 'Test',
    age: 35,
    gender: 'Male',
    occupation: 'Farmer',
    annualIncome: 100000,
    category: 'General',
    district: 'Ludhiana',
    isPunjabDomicile: true,
    landholdingAcres: 7.5,
    hasDisability: false,
    isWidowOrDestitute: false,
    isEnrolledInSchoolOrCollege: false,
  });

  assert.equal(defaults.cropAcreage, 7.5);
  assert.ok(defaults.familySize >= 1);
});
