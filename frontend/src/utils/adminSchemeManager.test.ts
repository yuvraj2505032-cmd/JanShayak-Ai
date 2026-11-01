import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_ADMIN_KNOWLEDGE_STATE,
  addAdminScheme,
  buildAiKnowledgeSummary,
  computeActiveSchemes,
  deleteAdminScheme,
  designateProfileRole,
  isAdminProfile,
  restoreDeletedSchemes,
  updateAdminScheme,
} from './adminSchemeManager';
import { GOV_SCHEMES } from '../data/schemes';
import type { CitizenProfile } from '../types/scheme';

const SAMPLE_PROFILE: CitizenProfile = {
  username: 'Gurpreet Singh',
  role: 'Citizen',
  age: 22,
  gender: 'Male',
  occupation: 'Student',
  annualIncome: 120000,
  category: 'SC',
  district: 'Ludhiana',
  isPunjabDomicile: true,
  landholdingAcres: 0,
  hasDisability: false,
  isWidowOrDestitute: false,
  isEnrolledInSchoolOrCollege: true,
};

test('designateProfileRole and isAdminProfile correctly toggle Citizen and Admin role state', () => {
  assert.equal(isAdminProfile(SAMPLE_PROFILE), false);
  const adminProfile = designateProfileRole(SAMPLE_PROFILE, 'Admin');
  assert.equal(adminProfile.role, 'Admin');
  assert.equal(isAdminProfile(adminProfile), true);

  const citizenAgain = designateProfileRole(adminProfile, 'Citizen');
  assert.equal(citizenAgain.role, 'Citizen');
  assert.equal(isAdminProfile(citizenAgain), false);
});

test('non-Admin role is blocked from adding, editing, or deleting schemes', () => {
  assert.throws(
    () =>
      addAdminScheme(
        INITIAL_ADMIN_KNOWLEDGE_STATE,
        {
          titleEn: 'Unauthorized Scheme',
          level: 'Punjab State',
          departmentEn: 'Dept of Finance',
          benefitAmountText: '₹10,000',
          benefitType: 'Direct Cash Transfer',
          descriptionEn: 'Should fail for Citizen role',
          officialPortalUrl: 'https://punjab.gov.in',
        },
        'Citizen'
      ),
    /Admin role is required/
  );

  assert.throws(
    () => deleteAdminScheme(INITIAL_ADMIN_KNOWLEDGE_STATE, 'pm-kisan', 'Citizen'),
    /Admin role is required/
  );
});

test('Admin can manually add, edit, and delete schemes and sync AI knowledge base', () => {
  const baseSchemes = GOV_SCHEMES.slice(0, 3);

  // 1. Add a new scheme as Admin
  const { nextState: stateAfterAdd, createdScheme } = addAdminScheme(
    INITIAL_ADMIN_KNOWLEDGE_STATE,
    {
      titleEn: 'Punjab Youth AI Innovation Fellowship 2026',
      level: 'Punjab State',
      departmentEn: 'Department of Higher Education & Languages, Punjab',
      benefitAmountText: '₹50,000 Annual Fellowship Grant',
      benefitType: 'Scholarship',
      descriptionEn: 'Direct fellowship grant for students building AI and digital governance solutions in Punjab.',
      minAge: 18,
      maxAge: 30,
      maxIncome: 300000,
      eligibleOccupations: ['Student', 'Unemployed Youth'],
      officialPortalUrl: 'https://scholarships.punjab.gov.in',
      requiredDocumentsText: 'Aadhaar Card, College Bonafide Certificate, Bank Passbook',
    },
    'Admin'
  );

  let active = computeActiveSchemes(baseSchemes, [], stateAfterAdd);
  assert.equal(active.length, 4);
  assert.equal(active[0].titleEn, 'Punjab Youth AI Innovation Fellowship 2026');
  assert.equal(active[0].requiredDocuments.length, 3);

  // 2. Edit an existing built-in scheme (e.g. baseSchemes[0]) as Admin
  const targetToEdit = baseSchemes[0];
  const { nextState: stateAfterEdit, updatedScheme } = updateAdminScheme(
    stateAfterAdd,
    targetToEdit,
    {
      titleEn: `${targetToEdit.titleEn} (Revised 2026)`,
      level: targetToEdit.level,
      departmentEn: targetToEdit.departmentEn,
      benefitAmountText: '₹12,000 / year Revised Entitlement',
      benefitType: targetToEdit.benefitType,
      descriptionEn: targetToEdit.descriptionEn,
      officialPortalUrl: targetToEdit.officialPortalUrl,
    },
    'Admin'
  );

  active = computeActiveSchemes(baseSchemes, [], stateAfterEdit);
  const editedInActive = active.find((s) => s.id === targetToEdit.id);
  assert.ok(editedInActive);
  assert.equal(editedInActive.titleEn, `${targetToEdit.titleEn} (Revised 2026)`);
  assert.equal(editedInActive.benefitAmountText, '₹12,000 / year Revised Entitlement');
  assert.equal(updatedScheme.id, targetToEdit.id);

  // 3. Delete both the custom scheme and a built-in scheme as Admin
  const stateAfterDeleteCustom = deleteAdminScheme(stateAfterEdit, createdScheme.id, 'Admin');
  const stateAfterDeleteBuiltIn = deleteAdminScheme(stateAfterDeleteCustom, baseSchemes[1].id, 'Admin');

  active = computeActiveSchemes(baseSchemes, [], stateAfterDeleteBuiltIn);
  assert.equal(active.length, 2);
  assert.equal(active.some((s) => s.id === createdScheme.id), false);
  assert.equal(active.some((s) => s.id === baseSchemes[1].id), false);

  // 4. Verify AI knowledge summary reflects the active modified schemes
  const aiKnowledge = buildAiKnowledgeSummary(active);
  assert.equal(aiKnowledge.length, 2);
  assert.equal(aiKnowledge[0].nameEn, `${targetToEdit.titleEn} (Revised 2026)`);
  assert.equal(aiKnowledge[0].benefits, '₹12,000 / year Revised Entitlement');

  // 5. Restore deleted default schemes
  const stateRestored = restoreDeletedSchemes(stateAfterDeleteBuiltIn, 'Admin');
  active = computeActiveSchemes(baseSchemes, [], stateRestored);
  assert.equal(active.length, 3);
  assert.equal(active.some((s) => s.id === baseSchemes[1].id), true);
});
