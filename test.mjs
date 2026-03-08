import { getSkySnapshot, nakshatraSignSpan, lahiriAyanamsa, RASHIS, NAKSHATRAS } from './index.mjs';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; }
  else { failed++; console.error(`FAIL: ${msg}`); }
}

// --- Test data arrays ---
assert(RASHIS.length === 12, 'Should have 12 rashis');
assert(NAKSHATRAS.length === 27, 'Should have 27 nakshatras');
assert(RASHIS[0].name === 'Aries', 'First rashi should be Aries');
assert(NAKSHATRAS[0].name === 'Ashwini', 'First nakshatra should be Ashwini');

// --- Test ayanamsa for J2000.0 epoch ---
const jd2000 = 2451545.0;
const ayanamsa2000 = lahiriAyanamsa(jd2000);
assert(Math.abs(ayanamsa2000 - 23.85) < 0.1, `Ayanamsa at J2000 should be ~23.85, got ${ayanamsa2000.toFixed(4)}`);

// --- Test sky snapshot structure ---
const sky = getSkySnapshot(new Date('2026-03-08T12:00:00Z'));
assert(sky.planets.Sun !== undefined, 'Should have Sun');
assert(sky.planets.Moon !== undefined, 'Should have Moon');
assert(sky.planets.Mercury !== undefined, 'Should have Mercury');
assert(sky.planets.Rahu !== undefined, 'Should have Rahu');
assert(sky.planets.Ketu !== undefined, 'Should have Ketu');
assert(typeof sky.moonPhase === 'string', 'moonPhase should be a string');
assert(sky.moonIllumination >= 0 && sky.moonIllumination <= 100, 'Illumination 0-100');

// --- Test planet data structure ---
const moon = sky.planets.Moon;
assert(typeof moon.siderealLon === 'number', 'Moon siderealLon should be a number');
assert(moon.siderealLon >= 0 && moon.siderealLon < 360, 'Moon lon should be 0-360');
assert(typeof moon.rashi.name === 'string', 'Moon rashi.name should be a string');
assert(moon.nakshatraPada >= 1 && moon.nakshatraPada <= 4, 'Moon pada should be 1-4');

// --- Test Rahu/Ketu are always retrograde ---
assert(sky.planets.Rahu.retrograde === true, 'Rahu should be retrograde');
assert(sky.planets.Ketu.retrograde === true, 'Ketu should be retrograde');

// --- Test Rahu + Ketu are ~180 deg apart ---
const rahuLon = sky.planets.Rahu.siderealLon;
const ketuLon = sky.planets.Ketu.siderealLon;
const diff = Math.abs(rahuLon - ketuLon);
const angular = Math.min(diff, 360 - diff);
assert(Math.abs(angular - 180) < 1, `Rahu-Ketu should be ~180 deg apart, got ${angular.toFixed(1)}`);

// --- Test nakshatraSignSpan ---
// Ashwini (index 0): 0-13.33 deg, fully in Aries (0-30 deg)
const ashwiniSpan = nakshatraSignSpan(0);
assert(ashwiniSpan.length === 1, 'Ashwini should span 1 sign');
assert(ashwiniSpan[0].sign.name === 'Aries', 'Ashwini should be in Aries');

// Krittika (index 2): 26.67-40 deg, spans Aries and Taurus
const krittikaSpan = nakshatraSignSpan(2);
assert(krittikaSpan.length === 2, 'Krittika should span 2 signs');
assert(krittikaSpan[0].sign.name === 'Aries', 'Krittika first sign should be Aries');
assert(krittikaSpan[1].sign.name === 'Taurus', 'Krittika second sign should be Taurus');

// Vishakha (index 15): spans Libra and Scorpio
const vishakhaSpan = nakshatraSignSpan(15);
assert(vishakhaSpan.length === 2, 'Vishakha should span 2 signs');
assert(vishakhaSpan[0].sign.name === 'Libra', 'Vishakha first sign should be Libra');
assert(vishakhaSpan[1].sign.name === 'Scorpio', 'Vishakha second sign should be Scorpio');

// --- Count: exactly 9 nakshatras should span 2 signs ---
let dualCount = 0;
for (let i = 0; i < 27; i++) {
  if (nakshatraSignSpan(i).length === 2) dualCount++;
}
assert(dualCount === 9, `Should have 9 dual-sign nakshatras, got ${dualCount}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
