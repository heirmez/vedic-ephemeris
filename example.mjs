import { getSkySnapshot, getAscendant, skyDataForPrompt, nakshatraSignSpan, NAKSHATRAS } from './index.mjs';

// --- Basic usage: get current planetary positions ---
const sky = getSkySnapshot();
console.log('=== Current Sky ===');
console.log(`Moon Phase: ${sky.moonPhase} (${sky.moonIllumination}%)`);
console.log(`Ayanamsa (Lahiri): ${sky.ayanamsa.toFixed(4)} deg\n`);

for (const [name, p] of Object.entries(sky.planets)) {
  const retro = p.retrograde ? ' [R]' : '';
  console.log(
    `${name.padEnd(8)} ${p.rashi.name.padEnd(12)} ${p.rashiDeg.toFixed(1).padStart(5)} deg  ` +
    `${p.nakshatra.name.padEnd(20)} pada ${p.nakshatraPada}${retro}`
  );
}

// --- Get positions for a specific date ---
console.log('\n=== Positions for Jan 1, 2026 UTC ===');
const sky2026 = getSkySnapshot(new Date('2026-01-01T00:00:00Z'));
const moon = sky2026.planets.Moon;
console.log(`Moon: ${moon.rashi.name} (${moon.rashi.sanskrit}) - ${moon.nakshatra.name} pada ${moon.nakshatraPada}`);

// --- Nakshatra sign spans ---
console.log('\n=== Nakshatras that span two signs ===');
for (const nak of NAKSHATRAS) {
  const span = nakshatraSignSpan(nak.index);
  if (span.length > 1) {
    const parts = span.map(g => `${g.sign.name} (padas ${g.padas.join(',')})`);
    console.log(`${nak.name.padEnd(20)} ${parts.join(' + ')}`);
  }
}

// --- Ascendant (Lagna) for a location ---
console.log('\n=== Ascendant for Thrissur, Kerala ===');
const lagna = getAscendant({
  date: new Date(),
  lat: 10.5276,   // Thrissur latitude
  lon: 76.2144,   // Thrissur longitude
});
console.log(`Rashi:     ${lagna.rashi.name} (${lagna.rashi.sanskrit})`);
console.log(`Degree:    ${lagna.rashiDeg.toFixed(1)}`);
console.log(`Nakshatra: ${lagna.nakshatra.name} pada ${lagna.nakshatraPada}`);
console.log(`LST:       ${lagna.localSiderealTime.toFixed(2)} deg`);

// --- Birth chart example ---
console.log('\n=== Simple Birth Chart ===');
const birthDate = new Date('1990-06-15T05:30:00Z'); // 11:00 AM IST
const birthSky = getSkySnapshot(birthDate);
const birthLagna = getAscendant({ date: birthDate, lat: 10.5276, lon: 76.2144 });
console.log(`Lagna: ${birthLagna.rashi.name} (1st house)`);
for (const [name, p] of Object.entries(birthSky.planets)) {
  // House = planet's rashi index - lagna rashi index + 1 (mod 12)
  const house = ((p.rashi.index - birthLagna.rashi.index + 12) % 12) + 1;
  console.log(`${name.padEnd(8)} in ${p.rashi.name.padEnd(12)} -> House ${house}`);
}

// --- Text output for LLM prompts (now with ascendant) ---
console.log('\n=== Sky data formatted for AI prompts ===');
console.log(skyDataForPrompt(sky, lagna));
