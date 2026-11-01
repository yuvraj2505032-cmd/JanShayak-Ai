import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseExplicitDeadlineString,
  classifyDeadlineUrgency,
  getUpcomingSavedSchemeDeadlines,
  getUnsavedUpcomingSchemeDeadlines
} from './deadlineAlerts';
import { GOV_SCHEMES } from '../data/schemes';
import { Scheme } from '../types/scheme';

test('parseExplicitDeadlineString parses ISO, DD Month YYYY, and Month DD YYYY formats', () => {
  const isoMs = parseExplicitDeadlineString('Portal closes 2026-11-20 for e-KYC');
  assert.equal(isoMs, Date.UTC(2026, 10, 20));

  const dmyMs = parseExplicitDeadlineString('30th November 2026 (Annual Scholarship Window)');
  assert.equal(dmyMs, Date.UTC(2026, 10, 30));

  const mdyMs = parseExplicitDeadlineString('November 15, 2026 Cutoff');
  assert.equal(mdyMs, Date.UTC(2026, 10, 15));

  const ongoingMs = parseExplicitDeadlineString('Open Year-Round (Continuous Registration)');
  assert.equal(ongoingMs, null);
});

test('classifyDeadlineUrgency categorizes 0-7 as critical, 8-15 as urgent, 16-30 as upcoming', () => {
  assert.equal(classifyDeadlineUrgency(0), 'critical');
  assert.equal(classifyDeadlineUrgency(7), 'critical');
  assert.equal(classifyDeadlineUrgency(8), 'urgent');
  assert.equal(classifyDeadlineUrgency(15), 'urgent');
  assert.equal(classifyDeadlineUrgency(16), 'upcoming');
  assert.equal(classifyDeadlineUrgency(30), 'upcoming');
});

test('getUpcomingSavedSchemeDeadlines filters saved schemes within 30 days and sorts by urgency', () => {
  const referenceDate = new Date('2026-11-01T00:00:00Z');
  const savedIds = new Set<string>([
    'post-matric-sc',          // 2026-11-30 -> 29 days left (within 30 days)
    'pm-kisan',                // 2026-11-20 -> 19 days left (within 30 days)
    'punjab-crm-machinery',    // 2026-11-08 -> 7 days left (within 30 days)
    'punjab-old-age-pension',  // 2026-12-31 -> 60 days left (outside 30-day window -> excluded)
    'sarbat-sehat-bima'        // Continuous ongoing -> excluded
  ]);

  const alerts = getUpcomingSavedSchemeDeadlines(GOV_SCHEMES, savedIds, referenceDate, 30);

  assert.equal(alerts.length, 3, 'Should only include the 3 saved schemes closing within 30 days');
  assert.deepEqual(
    alerts.map(a => a.scheme.id),
    ['punjab-crm-machinery', 'pm-kisan', 'post-matric-sc'],
    'Should sort ascending by daysRemaining (most urgent first)'
  );

  assert.equal(alerts[0].daysRemaining, 7);
  assert.equal(alerts[0].urgency, 'critical');
  assert.equal(alerts[0].formattedDateEn, '8 Nov 2026');

  assert.equal(alerts[1].daysRemaining, 19);
  assert.equal(alerts[1].urgency, 'upcoming');
  assert.equal(alerts[1].formattedDateEn, '20 Nov 2026');

  assert.equal(alerts[2].daysRemaining, 29);
  assert.equal(alerts[2].urgency, 'upcoming');
  assert.equal(alerts[2].formattedDateEn, '30 Nov 2026');
});

test('getUpcomingSavedSchemeDeadlines excludes past deadlines and deadlines beyond 30 days on custom schemes', () => {
  const referenceDate = new Date('2026-11-01T00:00:00Z');
  const baseScheme = GOV_SCHEMES[0];

  const customSchemes: Scheme[] = [
    { ...baseScheme, id: 'custom-past', titleEn: 'Past Scheme', applicationDeadline: '2026-10-25' },
    { ...baseScheme, id: 'custom-today', titleEn: 'Today Scheme', applicationDeadline: '2026-11-01' },
    { ...baseScheme, id: 'custom-day30', titleEn: 'Day 30 Scheme', applicationDeadline: '2026-12-01' },
    { ...baseScheme, id: 'custom-day31', titleEn: 'Day 31 Scheme', applicationDeadline: '2026-12-02' }
  ];

  const savedIds = ['custom-past', 'custom-today', 'custom-day30', 'custom-day31'];
  const alerts = getUpcomingSavedSchemeDeadlines(customSchemes, savedIds, referenceDate, 30);

  assert.deepEqual(
    alerts.map(a => a.scheme.id),
    ['custom-today', 'custom-day30'],
    'Should include day 0 and day 30, and exclude day -7 and day 31'
  );
  assert.equal(alerts[0].daysRemaining, 0);
  assert.equal(alerts[1].daysRemaining, 30);
});

test('getUnsavedUpcomingSchemeDeadlines returns schemes closing within 30 days that are not yet bookmarked', () => {
  const referenceDate = new Date('2026-11-01T00:00:00Z');
  const savedIds = new Set<string>(['pm-kisan']);
  const unsavedAlerts = getUnsavedUpcomingSchemeDeadlines(GOV_SCHEMES, savedIds, referenceDate, 30);

  assert.ok(unsavedAlerts.length > 0, 'Should find unsaved schemes with upcoming deadlines');
  assert.equal(
    unsavedAlerts.some(a => a.scheme.id === 'pm-kisan'),
    false,
    'Should not include already-saved schemes'
  );
});
